
'use server';

type Route =
  | {model: "gpt-4o-mini"; reason: string}
  | {model: "gpt-4o"; reason: string};

/**
 * Decides which AI model to use based on the query's complexity.
 * @param query The user's input query.
 * @returns A Route object with the selected model and the reason for the choice.
 */
export function route(query: string): Route {
  // Regex to detect complex queries that require deeper reasoning.
  const hard = /why|interpret|symbolism|compare|contra(diction|st)|timeline|cross[- ]ref|allegory|exegesis|canonical|optimize|explain how/i;
  
  // Check if the query is long.
  const long = query.length > 280;

  // Use the more powerful model for hard queries or long queries.
  if (hard.test(query) || long) {
    return { model: "gpt-4o", reason: "deep reasoning" };
  }
  
  // Default to the faster, cheaper model for simple lookups and UI interactions.
  return { model: "gpt-4o-mini", reason: "simple/lookup/UI" };
}
