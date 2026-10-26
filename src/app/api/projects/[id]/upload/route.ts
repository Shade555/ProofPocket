import { NextRequest, NextResponse } from "next/server";
import { getProjectById, saveProject } from "@/lib/db";
import {
  validateFileSafety,
  generateSafeId,
  sanitizeSafeFilename,
  DEFAULT_MAX_FILES_COUNT,
} from "@/lib/security";
import { extractPdfText } from "@/lib/pdfExtractor";
import { performOcr } from "@/lib/ocrAdapter";
import { GemmaProvider } from "@/lib/gemmaProvider";
import { traceProcessingStage } from "@/lib/telemetry";
import { DocumentMetadata, ExtractionMethod } from "@/types";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const project = await getProjectById(id);

  if (!project) {
    return NextResponse.json(
      { success: false, error: `Project "${id}" not found.` },
      { status: 404 }
    );
  }

  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: "No files provided in request." },
        { status: 400 }
      );
    }

    if (project.documents.length + files.length > DEFAULT_MAX_FILES_COUNT) {
      return NextResponse.json(
        {
          success: false,
          error: `Upload would exceed the maximum limit of ${DEFAULT_MAX_FILES_COUNT} documents per project. Current: ${project.documents.length}, Attempted: ${files.length}.`,
        },
        { status: 400 }
      );
    }

    const gemma = new GemmaProvider();
    const processedDocs: DocumentMetadata[] = [];

    for (const file of files) {
      // 1. Validate file safety (size, type)
      const safety = validateFileSafety({
        name: file.name,
        size: file.size,
        type: file.type,
      });

      if (!safety.valid) {
        return NextResponse.json(
          { success: false, error: safety.error },
          { status: 400 }
        );
      }

      const fileBuffer = Buffer.from(await file.arrayBuffer());
      const ext = file.name.split(".").pop()?.toLowerCase();
      let rawText = "";
      let extractionMethod: ExtractionMethod = "text-native";
      let pageCount: number | undefined = undefined;

      // 2. Extract text with tracing
      if (file.type === "application/pdf" || ext === "pdf") {
        extractionMethod = "pdf-text";
        const result = await traceProcessingStage(
          "file_extraction",
          { filename: file.name, sizeBytes: file.size, mimeType: file.type },
          async () => extractPdfText(fileBuffer)
        );

        rawText = result.text;
        pageCount = result.pageCount;

        // If PDF text extraction is empty, try OCR fallback as scanned PDF
        if (!rawText.trim()) {
          extractionMethod = "ocr";
          const ocrResult = await traceProcessingStage(
            "ocr",
            { filename: file.name, isScannedPdfFallback: true },
            async () => performOcr(fileBuffer)
          );
          rawText = ocrResult.text;
        }
      } else if (file.type.startsWith("image/") || ["png", "jpg", "jpeg"].includes(ext || "")) {
        extractionMethod = "ocr";
        const ocrResult = await traceProcessingStage(
          "ocr",
          { filename: file.name, sizeBytes: file.size, mimeType: file.type },
          async () => performOcr(fileBuffer)
        );
        rawText = ocrResult.text;
        pageCount = 1;
      } else {
        // Plain text (.txt)
        extractionMethod = "text-native";
        rawText = fileBuffer.toString("utf8");
        pageCount = 1;
      }

      const snippet = rawText
        .slice(0, 300)
        .replace(/\s+/g, " ")
        .trim();

      // 3. Extract candidate factual fields using Gemma provider
      const extractedFields = await gemma.extractDocumentFields({
        filename: file.name,
        text: rawText,
        mimeType: file.type,
      });

      const docId = generateSafeId("doc");
      const safeFilename = sanitizeSafeFilename(file.name);

      const docMetadata: DocumentMetadata = {
        id: docId,
        projectId: id,
        originalFilename: file.name,
        safeFilename,
        suggestedFilename: safeFilename,
        mimeType: file.type || "application/octet-stream",
        sizeBytes: file.size,
        uploadedAt: new Date().toISOString(),
        pageCount,
        extractionMethod,
        rawText,
        textSnippet: snippet,
        extractedFields,
        fileBufferBase64: fileBuffer.toString("base64"),
      };

      processedDocs.push(docMetadata);
    }

    // Append to project and save
    project.documents.push(...processedDocs);
    project.updatedAt = new Date().toISOString();
    await saveProject(project);

    // Return sanitized document metadata list (omitting huge base64 from response payload)
    const sanitizedReturn = processedDocs.map((d) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { fileBufferBase64, ...rest } = d;
      return rest;
    });

    return NextResponse.json(
      {
        success: true,
        message: `Successfully processed ${processedDocs.length} document(s).`,
        documents: sanitizedReturn,
      },
      { status: 200 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Document upload failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
