import { NextResponse } from "next/server";
import { previewPersonalizedEmails } from "@/lib/email/bulk-email-service";
import { isFirebaseAdminConfigured } from "@/lib/firebase-admin";
import { verifyAdminIdToken } from "@/lib/server/verify-admin";
import type { RecipientFilters } from "@/types/communications";
import type { SubmissionPurpose } from "@/types/dashboard";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json({ error: "Service is not configured." }, { status: 503 });
  }
  const admin = await verifyAdminIdToken(request.headers.get("authorization"));
  if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    const body = (await request.json()) as {
      filters?: RecipientFilters;
      purpose?: SubmissionPurpose;
      subject?: string;
      bodyHtml?: string;
      bodyText?: string;
      limit?: number;
    };

    const purpose = body.filters?.purpose ?? body.purpose;
    if (purpose !== "conference" && purpose !== "journal") {
      return NextResponse.json({ error: "filters.purpose is required." }, { status: 400 });
    }

    const filters: RecipientFilters = {
      ...(body.filters ?? { purpose }),
      purpose,
    };

    const result = await previewPersonalizedEmails(
      filters,
      body.subject ?? "Preview",
      body.bodyHtml ?? "<p>Preview</p>",
      body.bodyText,
      typeof body.limit === "number" ? body.limit : 10
    );

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not preview recipients.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
