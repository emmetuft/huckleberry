/**
 * Remove markdown code block markers from AI-generated text
 * Strips ```language and ``` markers (e.g., ```json, ```cypher, etc.)
 *
 * @param text - The AI-generated text response
 * @returns The cleaned text without code block markers
 */
export function stripCodeBlockMarkers(text: string): string {
  return text.trim().replace(/```\w*\n?|\n?```/g, '');
}

/**
 * Parse JSON array from AI-generated text response
 * Extracts the first JSON array found in the text
 *
 * @param text - The AI-generated text response
 * @returns The parsed JSON array, or null if parsing fails
 */
export function parseJsonArrayFromResponse<T = any>(text: string): T[] | null {
  const jsonMatch = text.match(/\[[\s\S]*\]/);

  if (!jsonMatch) {
    return null;
  }

  try {
    return JSON.parse(jsonMatch[0]) as T[];
  } catch (error) {
    console.error('[AI Response Parser] Failed to parse JSON:', error);
    return null;
  }
}
