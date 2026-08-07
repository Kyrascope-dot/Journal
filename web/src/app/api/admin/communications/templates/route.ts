import { NextResponse } from "next/server";
import {
  createOrUpdateTemplate,
  listTemplates,
} from "@/lib/email/bulk-email-service";
import { isFirebaseAdminConfigured } from "@/lib/firebase-admin";
import { verifyAdminIdToken } from "@/lib/server/verify-admin";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json({ error: "Service is not configured." }, { status: 503 });
  }
  const admin = await verifyAdminIdToken(request.headers.get("authorization"));
  if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    const templates = await listTemplates();
    return NextResponse.json({ templates });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load templates.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json({ error: "Service is not configured." }, { status: 503 });
  }
  const admin = await verifyAdminIdToken(request.headers.get("authorization"));
  if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    const body = (await request.json()) as {
      id?: string;
      name?: string;
      description?: string;
      audience?: "conference" | "journal" | "both";
      subject?: string;
      bodyHtml?: string;
      bodyText?: string;
    };

    if (!body.name?.trim() || !body.subject?.trim() || !body.bodyHtml?.trim()) {
      return NextResponse.json(
        { error: "name, subject, and bodyHtml are required." },
        { status: 400 }
      );
    }

    const template = await createOrUpdateTemplate({
      id: body.id,
      name: body.name,
      description: body.description,
      audience: body.audience ?? "both",
      subject: body.subject,
      bodyHtml: body.bodyHtml,
      bodyText: body.bodyText,
      createdById: admin.uid,
    });

    return NextResponse.json({ template });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save template.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
