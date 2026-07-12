export function buildAssetPrompt(
  question: string,
  assetCode: string,
  data: any
): string {
  return `
Question: ${question}
Target Asset: ${assetCode}

Database Context:
${JSON.stringify(data, null, 2)}

Instructions:
Formulate a clear answer about this asset's status, owner, or location using ONLY the database context above.
Include the asset code, name, current holder, and department when available.
If the asset is not found or context is empty, respond with: "I couldn't find this information."
`.trim();
}
