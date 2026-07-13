// Splits a long text into smaller overlapping chunks for embedding
function chunkText(text, chunkSize = 1000, overlap = 200) {
  const chunks = [];
  let startIndex = 0;

  while (startIndex < text.length) {
    const endIndex = Math.min(startIndex + chunkSize, text.length);
    const chunk = text.slice(startIndex, endIndex).trim();

    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    // Move forward, but keep some overlap so context isn't lost between chunks
    startIndex += chunkSize - overlap;
  }

  return chunks;
}

module.exports = chunkText;