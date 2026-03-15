/**
 * Splits text into overlapping chunks for embedding.
 * First splits on paragraph/stanza breaks (blank lines),
 * then merges short paragraphs and splits long ones to stay within chunkSize.
 */
export function chunkText(
  text: string,
  chunkSize = 500,
  overlap = 50
): string[] {
  // Normalize line endings and split on blank lines (paragraph/stanza breaks)
  const paragraphs = text
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  const chunks: string[] = [];
  let current = "";

  for (const paragraph of paragraphs) {
    if (paragraph.length > chunkSize) {
      // Save current buffer first
      if (current.trim()) {
        chunks.push(current.trim());
        current = "";
      }
      // Split long paragraph into sub-chunks with overlap
      let i = 0;
      while (i < paragraph.length) {
        const slice = paragraph.slice(i, i + chunkSize);
        chunks.push(slice.trim());
        i += chunkSize - overlap;
      }
    } else if (current.length + paragraph.length + 2 > chunkSize) {
      // Current buffer would overflow — save it and start fresh
      if (current.trim()) {
        chunks.push(current.trim());
        // Keep overlap from end of current buffer
        const overlapText = current.slice(-overlap);
        current = overlapText + "\n\n" + paragraph;
      } else {
        current = paragraph;
      }
    } else {
      current = current ? current + "\n\n" + paragraph : paragraph;
    }
  }

  if (current.trim()) {
    chunks.push(current.trim());
  }

  return chunks.filter((c) => c.length >= 20); // drop tiny fragments
}
