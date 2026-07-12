/**
 * @file    provider.types.ts
 * @desc    Interface contracts for extensible AI Context Providers.
 *          Allows other modules (Assets, Bookings, etc.) to inject data.
 */

import { type AIIntent } from "./intent.types.js";

export interface AIContextProvider {
  /** Uniquely identifies the provider, e.g. "asset-provider" */
  name: string;
  
  /** List of intents this provider responds to */
  supportedIntents: AIIntent[];
  
  /**
   * Retrieve structured data to enrich the prompt context.
   *
   * @param intent Classified user intent
   * @param params Extracted pattern params (e.g. { assetCode: "AF-001" })
   */
  getContext(
    intent: AIIntent,
    params: Record<string, string>
  ): Promise<Record<string, any>>;
}
