import { NextResponse } from "next/server";
import {
  createCampaign,
  listCampaigns,
  processDueScheduledCampaigns,
} from "@/lib/email/bulk-email-service";
import { isFirebaseAdminConfigured } from "@/lib/firebase-admin";
import { verifyAdminIdToken } from "@/lib/server/verify-admin";
import type { CreateCampaignPayload, RecipientFilters } from "@/types/communications";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json({ error: "Service is not configured." }, { status: 503 });
  }
  const admin = await verifyAdminIdToken(request.headers.get("authorization"));
  if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    await processDueScheduledCampaigns(2);
    const campaigns = await listCampaigns(100);
    return NextResponse.json({ campaigns });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load campaigns.";
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
    const body = (await request.json()) as CreateCampaignPayload;
    if (body.purpose !== "conference" && body.purpose !== "journal") {
      return NextResponse.json({ error: "purpose is required." }, { status: 400 });
    }
    if (!body.subject?.trim() || !body.bodyHtml?.trim()) {
      return NextResponse.json(
        { error: "subject and bodyHtml are required." },
        { status: 400 }
      );
    }
    if (!body.action || !["draft", "send", "schedule"].includes(body.action)) {
      return NextResponse.json(
        { error: "action must be draft, send, or schedule." },
        { status: 400 }
      );
    }

    const filters: RecipientFilters = {
      ...(body.filters ?? { purpose: body.purpose }),
      purpose: body.purpose,
    };

    const result = await createCampaign(admin, {
      ...body,
      filters,
      subject: body.subject.trim(),
      bodyHtml: body.bodyHtml,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create campaign.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
