export function buildReportPrompt(
  question: string,
  data: any
): string {
  return `
Question: ${question}

System Report Context:
${JSON.stringify(data, null, 2)}

Instructions:
Summarize this report data in a professional business tone using ONLY the context above.
Highlight key metrics, trends, and notable figures.
If the data is empty or null, respond with: "I couldn't find this information."
`.trim();
}
