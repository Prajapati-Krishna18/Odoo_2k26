import { AIIntent } from "../types/intent.types.js";

export interface DetectedIntentResult {
  intent: AIIntent;
  confidence: number;
  params: Record<string, string>;
}

export class IntentEngine {

  static detect(message: string): DetectedIntentResult {
    const text = message.toLowerCase().trim();
    const params: Record<string, string> = {};

    const assetCodeMatch = message.match(/([A-Za-z]{2,5}-\d{2,6})/);
    if (assetCodeMatch) {
      params["assetCode"] = assetCodeMatch[0].toUpperCase();
    }

    const assetNameMatch = message.match(/(?:laptop|macbook|iphone|ipad|monitor|printer|server|firewall|camera|drone|tablet|phone|keyboard|mouse|headset)\s+([A-Za-z0-9\s-]+)/i);
    if (assetNameMatch && !params["assetCode"]) {
      params["assetName"] = assetNameMatch[0].trim();
    }

    if (
      text.includes("who has") ||
      text.includes("owner of") ||
      text.includes("assigned to") ||
      text.includes("allocated to") ||
      text.includes("who is using")
    ) {
      if (params["assetCode"] || params["assetName"]) {
        return { intent: AIIntent.GET_ASSET_OWNER, confidence: 0.95, params };
      }
      const nameAfterWho = message.match(/(?:who has|who is using)\s+(?:the\s+)?([A-Za-z0-9\s-]+)/i);
      if (nameAfterWho && nameAfterWho[1]) {
        params["assetName"] = nameAfterWho[1].trim();
        return { intent: AIIntent.GET_ASSET_OWNER, confidence: 0.85, params };
      }
    }

    if (text.includes("overdue") || text.includes("late return") || text.includes("expired allocation") || text.includes("not returned") || text.includes("past due")) {
      return { intent: AIIntent.GET_OVERDUE_ASSETS, confidence: 0.9, params };
    }

    if (text.includes("available") || text.includes("free assets") || text.includes("unassigned") || text.includes("not allocated") || text.includes("unused")) {
      return { intent: AIIntent.GET_AVAILABLE_ASSETS, confidence: 0.9, params };
    }

    if (
      (text.includes("where is") || text.includes("location of") || text.includes("find")) &&
      params["assetCode"]
    ) {
      return { intent: AIIntent.GET_ASSET_LOCATION, confidence: 0.9, params };
    }

    if (
      text.includes("assets of") || text.includes("assets does") || text.includes("possessions of") || text.includes("allocated to employee") || text.includes("what does") || (text.includes("what") && text.includes("have"))
    ) {
      const nameMatch = message.match(/(?:assets of|assets does|belonging to|what does|what)\s+([a-zA-Z\s]+?)(?:\s+have|\s*$)/i);
      if (nameMatch && nameMatch[1]) {
        params["employeeName"] = nameMatch[1].trim();
      } else if (params["assetCode"]) {
        return { intent: AIIntent.GET_ASSET_OWNER, confidence: 0.8, params };
      }
      if (params["employeeName"]) {
        return { intent: AIIntent.GET_EMPLOYEE_ASSETS, confidence: 0.85, params };
      }
    }

    if (text.includes("department") || text.includes("dept") || text.includes("team info")) {
      const deptMatch = message.match(/(?:department|dept)\s+([a-zA-Z\s]+)/i);
      if (deptMatch && deptMatch[1]) {
        params["departmentName"] = deptMatch[1].trim();
      }
      return { intent: AIIntent.GET_DEPARTMENT_INFO, confidence: 0.85, params };
    }

    if (
      text.includes("dashboard") ||
      text.includes("summary") ||
      text.includes("overview") ||
      text.includes("metrics") ||
      text.includes("stats") ||
      text.includes("how many")
    ) {
      return { intent: AIIntent.GET_DASHBOARD_SUMMARY, confidence: 0.8, params };
    }

    if (text.includes("report") || text.includes("generate") || text.includes("export")) {
      return { intent: AIIntent.GET_REPORT, confidence: 0.75, params };
    }

    if (params["assetCode"]) {
      return { intent: AIIntent.GET_ASSET_OWNER, confidence: 0.6, params };
    }

    return { intent: AIIntent.UNKNOWN, confidence: 0.5, params };
  }
}
