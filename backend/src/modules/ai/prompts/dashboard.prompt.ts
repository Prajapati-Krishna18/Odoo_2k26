export function buildDashboardPrompt(
  question: string,
  stats: any
): string {
  return `
Question: ${question}

System Dashboard Context:
${JSON.stringify(stats, null, 2)}

Instructions:
Generate a professional metrics summary using ONLY the data above.
Include total assets, allocations, departments, employees, and overdue counts when available.
Format as a concise business briefing.
If data is empty or null, respond with: "I couldn't find this information."
`.trim();
}
