export interface OcrResult {
  text: string;
  confidence: number;
  error?: string;
}

/**
 * Isolated OCR Provider Adapter.
 * Extracts text from images (PNG, JPEG) using Tesseract.js with fallback.
 */
export async function performOcr(
  imageBuffer: Buffer
): Promise<OcrResult> {
  if (!imageBuffer || imageBuffer.length === 0) {
    return { text: "", confidence: 0, error: "Empty image buffer." };
  }

  try {
    // Dynamic import to prevent loading heavy WASM worker when not needed
    const { createWorker } = await import("tesseract.js");

    const worker = await createWorker("eng");
    const ret = await worker.recognize(imageBuffer);
    await worker.terminate();

    const cleanText = (ret.data.text || "")
      .replace(/\r\n/g, "\n")
      .replace(/[ \t]+/g, " ")
      .trim();

    return {
      text: cleanText,
      confidence: (ret.data.confidence || 0) / 100,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "OCR processing failed";
    return {
      text: "",
      confidence: 0,
      error: `OCR extraction failed: ${errorMsg}. Please ensure image is clear or upload PDF format.`,
    };
  }
}
