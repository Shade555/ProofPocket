import { NextRequest, NextResponse } from "next/server";
import { getProjectById, updateProject, deleteProjectById } from "@/lib/db";
import { projectUpdateSchema } from "@/lib/schemas";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
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

  return NextResponse.json({ success: true, project });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const parseResult = projectUpdateSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid update payload",
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const updated = await updateProject(id, parseResult.data);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: `Project "${id}" not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, project: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update project";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const deleted = await deleteProjectById(id);

  if (!deleted) {
    return NextResponse.json(
      { success: false, error: `Project "${id}" not found.` },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    message: `Project "${id}" and associated documents deleted successfully.`,
  });
}
