export function buildGeneralPrompt(
  question: string,
  contextData: any
): string {
  return `
Question: ${question}

System Reference Context:
${JSON.stringify(contextData, null, 2)}

Instructions:
Answer using ONLY the Reference Context above.
If the context is empty, null, or lacks the specific details needed, reply exactly with:
"I couldn't find this information."
Do not speculate or infer beyond the provided data.
`.trim();
}
