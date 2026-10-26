export interface PdfExtractionResult {
  text: string;
  pageCount: number;
  info?: Record<string, unknown>;
  error?: string;
}

/**
 * Extracts raw text and page metadata from a PDF buffer.
 * Gracefully handles malformed, encrypted, or empty PDF documents.
 */
export async function extractPdfText(buffer: Buffer): Promise<PdfExtractionResult> {
  if (!buffer || buffer.length === 0) {
    return {
      text: "",
      pageCount: 0,
      error: "Empty PDF buffer provided.",
    };
  }

  try {
    // Dynamic import to handle SSR / serverless environments cleanly
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require("pdf-parse");

    const options = {
      pagerender: (pageData: { getTextContent: () => Promise<{ items: Array<{ str: string }> }> }) => {
        return pageData.getTextContent().then((textContent) => {
          let lastY: number | undefined;
          let text = "";
          for (const item of textContent.items) {
            if (lastY === undefined || lastY === (item as unknown as { transform: number[] }).transform?.[5]) {
              text += item.str;
            } else {
              text += "\n" + item.str;
            }
            lastY = (item as unknown as { transform: number[] }).transform?.[5];
          }
          return text;
        });
      },
    };

    const data = await pdfParse(buffer, options);

    const cleanText = (data.text || "")
      .replace(/\r\n/g, "\n")
      .replace(/[ \t]+/g, " ")
      .trim();

    return {
      text: cleanText,
      pageCount: data.numpages || 1,
      info: data.info,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Unknown PDF parsing error";
    // Check if error is due to encryption / password
    if (errorMsg.toLowerCase().includes("password") || errorMsg.toLowerCase().includes("encrypt")) {
      return {
        text: "",
        pageCount: 0,
        error: "PDF is password-protected or encrypted. Please upload an unencrypted document.",
      };
    }

    return {
      text: "",
      pageCount: 0,
      error: `Failed to extract text from PDF: ${errorMsg}`,
    };
  }
}
