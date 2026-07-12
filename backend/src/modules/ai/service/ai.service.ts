import { generateGeminiText } from "../../../config/gemini.js";
import { AIIntent } from "../types/intent.types.js";
import { type AIContextProvider } from "../types/provider.types.js";
import { AIRepository } from "../repository/ai.repository.js";
import { IntentEngine } from "./intent.service.js";
import { SYSTEM_PROMPT } from "../prompts/system.prompt.js";
import { buildAssetPrompt } from "../prompts/asset.prompt.js";
import { buildDashboardPrompt } from "../prompts/dashboard.prompt.js";
import { buildGeneralPrompt } from "../prompts/general.prompt.js";
import { buildReportPrompt } from "../prompts/report.prompt.js";

class AIProviderRegistryClass {
  private providers: AIContextProvider[] = [];

  register(provider: AIContextProvider) {
    if (!this.providers.some((p) => p.name === provider.name)) {
      this.providers.push(provider);
      console.log(`AI Context Provider registered: '${provider.name}'`);
    }
  }

  findProviderForIntent(intent: AIIntent): AIContextProvider | undefined {
    return this.providers.find((p) => p.supportedIntents.includes(intent));
  }
}

export const AIProviderRegistry = new AIProviderRegistryClass();

export class AIService {

  static async chat(userMessage: string): Promise<{
    answer: string;
    intent: AIIntent;
    confidence: number;
  }> {
    const classification = IntentEngine.detect(userMessage);
    const { intent, confidence, params } = classification;

    const dbContext = await this.fetchContextData(intent, params);

    const prompt = this.buildPrompt(userMessage, intent, params, dbContext);

    const answer = await generateGeminiText(prompt, SYSTEM_PROMPT);

    return {
      answer,
      intent,
      confidence,
    };
  }

  private static async fetchContextData(
    intent: AIIntent,
    params: Record<string, string>
  ): Promise<any> {
    const provider = AIProviderRegistry.findProviderForIntent(intent);
    if (provider) {
      try {
        return await provider.getContext(intent, params);
      } catch (err) {
        console.error(`AI Context Provider '${provider.name}' failed:`, err);
        return { error: "Failed to load module context dynamically." };
      }
    }

    switch (intent) {
      case AIIntent.GET_ASSET_OWNER:
        return AIRepository.getAssetByCode(params["assetCode"] || "", params["assetName"]);

      case AIIntent.GET_AVAILABLE_ASSETS:
        return AIRepository.getAvailableAssets();

      case AIIntent.GET_EMPLOYEE_ASSETS:
        return AIRepository.getEmployeeAssets(params["employeeName"] || "");

      case AIIntent.GET_DEPARTMENT_INFO:
        return AIRepository.getDepartmentContext(params["departmentName"] || "");

      case AIIntent.GET_DASHBOARD_SUMMARY:
        return AIRepository.getSystemOverview();

      case AIIntent.GET_REPORT:
        return AIRepository.getSystemOverview();

      case AIIntent.GET_OVERDUE_ASSETS:
        return AIRepository.getOverdueAssets();

      case AIIntent.GET_ASSET_LOCATION:
        return AIRepository.getAssetLocation(params["assetCode"] || "", params["assetName"]);

      default:
        return AIRepository.getSystemOverview();
    }
  }

  private static buildPrompt(
    question: string,
    intent: AIIntent,
    params: Record<string, string>,
    contextData: any
  ): string {
    switch (intent) {
      case AIIntent.GET_ASSET_OWNER:
      case AIIntent.GET_ASSET_LOCATION:
        return buildAssetPrompt(question, params["assetCode"] || "unknown", contextData);

      case AIIntent.GET_DASHBOARD_SUMMARY:
        return buildDashboardPrompt(question, contextData);

      case AIIntent.GET_REPORT:
        return buildReportPrompt(question, contextData);

      default:
        return buildGeneralPrompt(question, contextData);
    }
  }
}
