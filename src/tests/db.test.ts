import { describe, it, expect } from "vitest";
import {
  getProjectById,
  getAllProjects,
  saveProject,
  updateProject,
  deleteProjectById,
  retrieveProjectEvidence,
} from "@/lib/db";
import { SYNTHETIC_PROJECT } from "@/fixtures/syntheticDemo";
import { Project } from "@/types";

describe("Database & Memory Storage Repository", () => {
  it("retrieves the synthetic demo project out of the box", async () => {
    const demo = await getProjectById(SYNTHETIC_PROJECT.id);
    expect(demo).not.toBeNull();
    expect(demo?.name).toContain("Apex Global Leaders Fellowship");
  });

  it("lists all available projects", async () => {
    const list = await getAllProjects();
    expect(list.length).toBeGreaterThan(0);
  });

  it("saves, updates, and deletes a custom project (guaranteeing deletion workflow)", async () => {
    const testProj: Project = {
      id: "test_proj_deletion_123",
      name: "Temporary Test Pack",
      instructionsText: "Submit your thesis.",
      deadline: null,
      status: "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      documents: [],
      requirements: [],
      matches: [],
      stats: {
        totalRequirements: 0,
        satisfied: 0,
        partiallySatisfied: 0,
        missing: 0,
        needsReview: 0,
        estimatedTimeSavedMinutes: 0,
      },
    };

    // Save
    await saveProject(testProj);
    const retrieved = await getProjectById(testProj.id);
    expect(retrieved?.name).toBe("Temporary Test Pack");

    // Update
    const updated = await updateProject(testProj.id, { name: "Renamed Pack" });
    expect(updated?.name).toBe("Renamed Pack");

    // Delete
    const deleted = await deleteProjectById(testProj.id);
    expect(deleted).toBe(true);

    const afterDelete = await getProjectById(testProj.id);
    expect(afterDelete).toBeNull();
  });

  it("retrieves evidence snippets strictly scoped within the project", async () => {
    const results = await retrieveProjectEvidence(SYNTHETIC_PROJECT.id, "GPA transcript");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].text.toLowerCase()).toMatch(/gpa|transcript/);
  });
});
