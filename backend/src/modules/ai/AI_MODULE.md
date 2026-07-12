# AssetFlow AI Assistant Module

## Architecture

```
User
  │
  ▼
React Chat UI (POST /api/ai/chat)
  │
  ▼
AI Controller (validation, sanitization, error mapping)
  │
  ▼
AI Service (orchestrator)
  │
  ├── IntentEngine.detect() → classify question
  │       ▼
  │   AIIntent enum (GET_ASSET_OWNER, GET_AVAILABLE_ASSETS, etc.)
  │       ▼
  ├── fetchContextData() → AIRepository (Prisma queries)
  │       ▼
  ├── buildPrompt() → prompt template + context → Gemini prompt
  │       ▼
  └── generateGeminiText() → Gemini 2.0 Flash API
          ▼
      Formatted response → HTTP 200
```

## Intent Flow

1. User sends `"Who has Laptop AF-001?"`
2. `IntentEngine.detect()` matches `GET_ASSET_OWNER` with `{ assetCode: "AF-001" }` at 95% confidence
3. `fetchContextData()` calls `AIRepository.getAssetByCode("AF-001")`
4. Prisma returns `{ code, name, status, allocations: [{ employee: { fullName } }], ... }`
5. `buildPrompt()` compiles: question + asset code + JSON context
6. Gemini receives structured prompt + system instruction
7. Gemini returns: "Laptop AF-001 is currently allocated to Rahul Sharma."
8. Controller wraps in `ApiResponse` and sends to client

## Intent Detection Rules

| Intent | Keywords | Params Extracted |
|--------|----------|-----------------|
| GET_ASSET_OWNER | who has, owner of, assigned to, allocated to, who is using | assetCode (AF-001), assetName |
| GET_AVAILABLE_ASSETS | available, free assets, unassigned, not allocated, unused | (none) |
| GET_EMPLOYEE_ASSETS | assets of, belongings of, what does X have | employeeName |
| GET_DEPARTMENT_INFO | department, dept, team info | departmentName |
| GET_DASHBOARD_SUMMARY | dashboard, summary, overview, metrics, stats, how many | (none) |
| GET_REPORT | report, generate, export | (none) |
| GET_OVERDUE_ASSETS | overdue, late return, expired allocation, not returned, past due | (none) |
| GET_ASSET_LOCATION | where is, location of, find | assetCode (AF-001), assetName |
| UNKNOWN | (no match) | (empty) |

## Prisma Data Flow

All database access occurs through the Repository layer only.

```
AI Service
  │
  ▼
AIRepository (static methods)
  │
  ▼
prisma (PrismaClient from config/prisma.ts)
  │
  ▼
PostgreSQL (Supabase)
```

### Repository Methods

- `getAssetByCode(code, name?)` - Asset details + active allocation + employee
- `getAvailableAssets()` - All AVAILABLE assets with category/department
- `getOverdueAssets()` - All ACTIVE allocations past expected_return_at
- `getEmployeeAssets(name)` - User with their active asset allocations
- `getDepartmentContext(name)` - Department details + head + employee/asset counts
- `getAssetLocation(code, name?)` - Asset location + status + current holder
- `getSystemOverview()` - Aggregate counts: departments, employees, assets, overdue

## Prompt Flow

Each intent uses a dedicated prompt template:

```
prompts/
├── system.prompt.ts    # Master persona + constraints (120 word limit, no hallucination)
├── asset.prompt.ts     # Asset ownership, location queries
├── dashboard.prompt.ts # Metrics/summary/dashboard queries
├── report.prompt.ts    # Report generation queries
└── general.prompt.ts   # Fallback for unknown intents
```

All prompts follow these rules:
- Include the raw user question
- Include JSON-serialized database context
- Instruct Gemini to use ONLY the provided context
- If context is empty/null: respond "I couldn't find this information."
- Maximum 120 words
- Professional business tone

## Gemini Integration

Configured in `config/gemini.ts`:
- Model: `gemini-2.0-flash`
- Temperature: 0.2 (low for factual accuracy)
- Max output tokens: 250 (~120 words)
- API key from `GEMINI_API_KEY` env var
- Falls back gracefully when API key is not configured

## Error Handling

| Scenario | HTTP Status | Response |
|----------|-------------|----------|
| Missing API key | 503 | "AI service is currently unavailable" |
| Gemini timeout | 500 | Forwarded to error middleware |
| Rate limit (429) | 429 | "AI service rate limit exceeded" |
| Gemini returns error | 502 | Mapped to appropriate error |
| Invalid user input | 400 | Zod validation errors |
| Prompt injection detected | 400 | "Message was blocked" |
| Database error | 500 | Forwarded to error middleware |

## Future Extension: Provider Registry

The AI module is designed for extensibility via the `AIContextProvider` interface.

### Adding a New Module

```typescript
// In your module file (e.g., modules/asset/ai-provider.ts)
import { AIProviderRegistry } from "../ai/service/ai.service.js";
import { AIIntent } from "../ai/types/intent.types.js";

const assetProvider = {
  name: "asset-provider",
  supportedIntents: [
    AIIntent.GET_ASSET_OWNER,
    AIIntent.GET_AVAILABLE_ASSETS,
    AIIntent.GET_OVERDUE_ASSETS,
  ],
  async getContext(intent: AIIntent, params: Record<string, string>) {
    // Your custom DB queries here
    return { /* context data */ };
  },
};

// Register at module init
AIProviderRegistry.register(assetProvider);
```

Any module (Asset, Booking, Maintenance, Audit) can implement `AIContextProvider` and register itself. The AI Service checks the registry first before falling back to core repository methods.

## Security

- User input is sanitized via `sanitizeInput()` - strips HTML, blocks prompt injection keywords
- Zod validation limits message length to 500 chars
- JWT authentication required on `/api/ai/chat`
- Gemini never receives raw database connection info
- Only required fields are selected in Prisma queries (never entire tables)
- No API keys, secrets, or DB URLs are exposed to the LLM

## Performance

- Prisma queries select only needed fields (no `select *`)
- Intent detection is O(n) regex matching (no LLM call for classification)
- Gemini maxOutputTokens: 250 ensures fast response times
- System overview aggregates use `Promise.all` for parallel queries
- Repository methods have focused, single-purpose queries

## Frontend Integration

### API Call (using fetch)

```typescript
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function sendChatMessage(message: string) {
  const token = localStorage.getItem("accessToken");

  const res = await fetch(`${API_BASE}/api/ai/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ message }),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || "AI request failed");
  }

  return json.data; // { answer: string, intent: string, confidence: number }
}
```

### Response Shape

```typescript
interface ChatResponse {
  success: boolean;
  message: string;
  data: {
    answer: string;    // Gemini's natural language response
    intent: string;    // Detected intent (e.g. "GET_ASSET_OWNER")
    confidence: number; // Detection confidence (0.0 - 1.0)
  };
}
```

### Example Chat Component Usage

The included `AIChatPanel` component is a floating chat widget that:
- Renders as a fixed-position button (bottom-right)
- Opens a chat panel with message history
- Sends messages to `/api/ai/chat` with JWT auth
- Shows typing indicator during API calls
- Provides example questions for new users
- Supports keyboard submit (Enter)

To use it independently:
```tsx
import AIChatPanel from "@/components/AIChatPanel";

function Layout() {
  return (
    <div>
      <YourApp />
      <AIChatPanel />
    </div>
  );
}
```

## Bonus AI Features (Recommended)

### 1. Predictive Maintenance
Analyze maintenance history + asset age to predict when assets need servicing.
Use Gemini to generate maintenance schedules and alerts.

### 2. Smart Asset Recommendation
When an employee requests equipment, Gemini can suggest the best available asset
based on department, role, and past allocations.

### 3. AI Report Generator
Natural language → structured report with charts.
"Generate a monthly report on laptop allocation trends" → compiled analytics.

### 4. Voice Assistant
Add Web Speech API → speech-to-text → `/api/ai/chat` → text-to-speech response.

### 5. Natural Language Search
Replace dropdown filters with "Show me all Dell laptops allocated to Engineering"
→ parsed into structured DB query → filtered results.

### 6. Anomaly Detection
Gemini flags unusual patterns: "An asset was reassigned 5 times in 30 days"
→ triggers alert notification.

### 7. Audit Narrative Generator
After physical inventory audits, Gemini writes human-readable discrepancy reports
from raw scan data.
