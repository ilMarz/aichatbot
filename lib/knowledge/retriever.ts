import { getKnowledgeDocumentCount, searchSimilarChunks } from "@/lib/db/queries";
import { generateEmbedding } from "./embeddings";

/**
 * Retrieves the most relevant knowledge chunks for a given query.
 * Returns an empty array if no documents exist (no API call made).
 */
export async function retrieveRelevantChunks(
  query: string,
  topK = 5
): Promise<string[]> {
  if (!query.trim()) return [];

  // Short-circuit: skip embedding API if knowledge base is empty
  const count = await getKnowledgeDocumentCount();
  if (count === 0) return [];

  const queryEmbedding = await generateEmbedding(query);
  const chunks = await searchSimilarChunks(queryEmbedding, topK);
  return chunks;
}
