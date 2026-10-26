import { NextRequest, NextResponse } from "next/server";
import { getAllProjects, saveProject } from "@/lib/db";
import { projectCreateSchema } from "@/lib/schemas";
import { generateSafeId } from "@/lib/security";
import { Project } from "@/types";
import { SYNTHETIC_PROJECT } from "@/fixtures/syntheticDemo";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const projects = await getAllProjects();
    return NextResponse.json({ success: true, projects });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to retrieve projects";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Check if user requested spawning a new copy of the synthetic demo
    if (body.createSyntheticDemo) {
      const demoId = generateSafeId("proj_demo");
      const clonedDemo: Project = {
        ...SYNTHETIC_PROJECT,
        id: demoId,
        name: `${SYNTHETIC_PROJECT.name} (Exploration Copy)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isSyntheticDemo: true,
      };
      await saveProject(clonedDemo);
      return NextResponse.json({ success: true, project: clonedDemo }, { status: 201 });
    }

    const parseResult = projectCreateSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid project parameters",
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { name, instructionsText, deadline, notes } = parseResult.data;
    const projectId = generateSafeId("proj");

    const newProject: Project = {
      id: projectId,
      name,
      instructionsText,
      deadline: deadline || null,
      notes: notes || "",
      status: "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      documents: [],
      requirements: [],
      matches: [],
      isSyntheticDemo: false,
      stats: {
        totalRequirements: 0,
        satisfied: 0,
        partiallySatisfied: 0,
        missing: 0,
        needsReview: 0,
        estimatedTimeSavedMinutes: 0,
      },
    };

    await saveProject(newProject);
    return NextResponse.json({ success: true, project: newProject }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create project";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
