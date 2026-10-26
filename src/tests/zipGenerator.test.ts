import { describe, it, expect } from "vitest";
import { generateApplicationPackZip } from "@/lib/zipGenerator";
import { SYNTHETIC_PROJECT } from "@/fixtures/syntheticDemo";
import JSZip from "jszip";

describe("Application Pack ZIP Generator", () => {
  it("generates a valid ZIP archive with all required reports", async () => {
    const pack = await generateApplicationPackZip(SYNTHETIC_PROJECT);

    expect(pack.zipBuffer).toBeDefined();
    expect(pack.zipBuffer.length).toBeGreaterThan(0);
    expect(pack.fileManifest.length).toBeGreaterThan(0);

    // Verify reports content
    expect(pack.reports.markdownChecklist).toContain("# ProofPocket Application Pack Checklist");
    expect(pack.reports.missingItemsReport).toContain("# ProofPocket Action Items & Missing Evidence Report");
    expect(pack.reports.provenanceReport).toContain("# ProofPocket Provenance & Evidence Audit Trail");
    expect(pack.reports.jsonReport).toContain("Apex Global Leaders Fellowship 2026");

    // Unzip and inspect files
    const unzipped = await JSZip.loadAsync(pack.zipBuffer);
    expect(unzipped.file("APPLICATION_PACK_CHECKLIST.md")).not.toBeNull();
    expect(unzipped.file("APPLICATION_PACK_REPORT.json")).not.toBeNull();
    expect(unzipped.file("MISSING_AND_ACTION_ITEMS.md")).not.toBeNull();
    expect(unzipped.file("PROVENANCE_AND_EVIDENCE_AUDIT.md")).not.toBeNull();

    // Verify documents subdirectory (excluding directory entry itself)
    const docFiles = Object.keys(unzipped.files).filter(
      (k) => k.startsWith("documents/") && !unzipped.files[k].dir && k !== "documents/"
    );
    expect(docFiles.length).toBe(SYNTHETIC_PROJECT.documents.length);
  });

  it("never includes traversal dots (..) in ZIP file paths", async () => {
    const pack = await generateApplicationPackZip(SYNTHETIC_PROJECT);
    for (const manifestItem of pack.fileManifest) {
      expect(manifestItem.path).not.toContain("..");
      expect(manifestItem.path.startsWith("/")).toBe(false);
    }
  });
});
