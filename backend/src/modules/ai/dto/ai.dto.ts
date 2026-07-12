/**
 * @file    ai.dto.ts
 * @desc    Data Transfer Objects for AI Assistant.
 */

export interface ChatRequestDTO {
  message: string;
}

export interface ChatResponseDTO {
  success: boolean;
  answer: string;
  intent: string;
  confidence: number;
}
