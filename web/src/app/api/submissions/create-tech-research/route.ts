import { NextResponse } from "next/server";
import type { SubmissionStatus } from "@/types/dashboard";
import {
  buildTechResearchSubmissionPayload,
  type EducationLevel,
  type ProjectType,
  type TechResearchApplicationForm,
  type TechResearchSubmissionPayload,
} from "@/lib/tech-research-application";
import {
  TECH_RESEARCH_SUBMISSION_FEE_DISPLAY,
  TECH_RESEARCH_SUBMISSION_FEE_USD,
} from "@/lib/tech-research-config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EDUCATION_LEVELS = new Set<EducationLevel>([
  "high_school",
  "undergraduate",
  "postgraduate",
  "other",
]);
const PROJECT_TYPES = new Set<ProjectType>(["individual", "team"]);

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function cleanString(value: unknown, maxLength: number): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function isValidRequiredUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isValidOptionalUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true;
  return isValidRequiredUrl(trimmed);
}

function parsePayload(raw: unknown): TechResearchSubmissionPayload | null {
  if (!raw || typeof raw !== "object") return null;
  const source = raw as Record<string, unknown>;
  const projectEducationLevel = source.projectEducationLevel;
  const projectType = source.projectType;
  if (
    typeof projectEducationLevel !== "string" ||
    !EDUCATION_LEVELS.has(projectEducationLevel as EducationLevel) ||
    typeof projectType !== "string" ||
    !PROJECT_TYPES.has(projectType as ProjectType)
  ) {
    return null;
  }

  const declarations = source.declarations;
  if (!declarations || typeof declarations !== "object") return null;
  const dec = declarations as Record<string, unknown>;
  const requiredBools = [
    "original",
    "cited",
    "contributors",
    "aiDisclosed",
    "permission",
    "ethics",
  ] as const;
  for (const key of requiredBools) {
    if (dec[key] !== true) return null;
  }

  const teamMembersRaw = Array.isArray(source.teamMembers) ? source.teamMembers : [];
  const teamMembers = teamMembersRaw.slice(0, 12).map((member) => {
    const row = member as Record<string, unknown>;
    return {
      fullName: cleanString(row.fullName, 200),
      email: cleanString(row.email, 320),
      institution: cleanString(row.institution, 300),
      role: cleanString(row.role, 200),
    };
  });

  const supplementaryMaterialUrl = cleanString(source.supplementaryMaterialUrl, 500);

  const formLike: TechResearchApplicationForm = {
    projectTitle: cleanString(source.projectTitle, 500),
    researchArea: cleanString(source.researchArea, 300),
    projectEducationLevel: projectEducationLevel as EducationLevel,
    projectType: projectType as ProjectType,
    fullName: cleanString(source.fullName, 200),
    email: cleanString(source.email, 320),
    institution: cleanString(source.institution, 500),
    country: cleanString(source.country, 120),
    teamMembers:
      projectType === "team" && teamMembers.length > 0
        ? teamMembers
        : [{ fullName: "", email: "", institution: "", role: "" }],
    researchQuestion: cleanString(source.researchQuestion, 5000),
    abstract: cleanString(source.abstract, 20_000),
    problemAddressed: cleanString(source.problemAddressed, 5000),
    methods: cleanString(source.methods, 5000),
    keyFindings: cleanString(source.keyFindings, 5000),
    technologiesUsed: cleanString(source.technologiesUsed, 2000),
    keywords: cleanString(source.keywords, 500),
    supplementaryMaterialUrl,
    repositoryUrl: cleanString(source.repositoryUrl, 500),
    projectUrl: cleanString(source.projectUrl, 500),
    videoUrl: cleanString(source.videoUrl, 500),
    datasetUrl: cleanString(source.datasetUrl, 500),
    declarationOriginal: true,
    declarationCited: true,
    declarationContributors: true,
    declarationAiDisclosed: true,
    declarationPermission: true,
    declarationEthics: true,
  };

  if (
    !formLike.projectTitle ||
    !formLike.researchArea ||
    !formLike.fullName ||
    !formLike.email ||
    !formLike.institution ||
    !formLike.country ||
    !formLike.researchQuestion ||
    !formLike.abstract ||
    !formLike.problemAddressed ||
    !formLike.methods ||
    !formLike.keyFindings ||
    !formLike.technologiesUsed ||
    !formLike.keywords ||
    !isValidRequiredUrl(formLike.supplementaryMaterialUrl)
  ) {
    return null;
  }

  if (
    !isValidOptionalUrl(formLike.repositoryUrl) ||
    !isValidOptionalUrl(formLike.projectUrl) ||
    !isValidOptionalUrl(formLike.videoUrl) ||
    !isValidOptionalUrl(formLike.datasetUrl)
  ) {
    return null;
  }

  if (projectType === "team") {
    for (const member of teamMembers) {
      if (!member.fullName || !member.email || !member.institution) return null;
    }
  }

  return buildTechResearchSubmissionPayload(formLike);
}

export async function POST(request: Request) {
  try {
    const { getAdminFirestore, isFirebaseAdminConfigured } = await import("@/lib/firebase-admin");
    const { verifyUserIdToken } = await import("@/lib/server/verify-user");
    const { Timestamp } = await import("firebase-admin/firestore");

    if (!isFirebaseAdminConfigured()) {
      return jsonError(
        "Server-side submission registration is not configured. Set Firebase Admin credentials.",
        503
      );
    }

    const user = await verifyUserIdToken(request.headers.get("authorization"));
    if (!user) {
      return jsonError("Unauthorized. Please sign in again and retry.", 401);
    }

    let parsedJson: unknown;
    try {
      parsedJson = await request.json();
    } catch {
      return jsonError("Invalid JSON body.", 400);
    }

    const payload = parsePayload(parsedJson);
    if (!payload) {
      return jsonError("Required submission fields are missing or invalid.", 400);
    }

    const db = getAdminFirestore();
    const profileSnap = await db.doc(`users/${user.uid}`).get();
    const profile = profileSnap.data();
    const authorEmail = cleanString(profile?.email ?? user.email, 320);
    const authorName = cleanString(payload.fullName || profile?.displayName || authorEmail, 300);
    if (!authorEmail) {
      return jsonError(
        "Your account email is missing. Update your profile and try again.",
        400
      );
    }

    const now = Timestamp.now();
    const year = now.toDate().getUTCFullYear();
    const prefix = "GCRT";
    const initialStatus: SubmissionStatus = "pending";
    const counterRef = db.doc(`registrationCounters/${prefix}-${year}`);
    const submissionRef = db.collection("submissions").doc();

    let registrationId = "";
    await db.runTransaction(async (transaction) => {
      const counterSnap = await transaction.get(counterRef);
      const lastNumber = counterSnap.exists
        ? Number(counterSnap.data()?.lastNumber ?? 0)
        : 0;
      const nextNumber = lastNumber + 1;
      registrationId = `${prefix}-${year}-${String(nextNumber).padStart(6, "0")}`;
      const registrationRef = db.doc(`registrationIds/${registrationId}`);
      const registrationSnap = await transaction.get(registrationRef);
      if (registrationSnap.exists) {
        throw new Error("Registration ID collision. Please retry.");
      }

      transaction.set(
        counterRef,
        {
          prefix,
          year,
          lastNumber: nextNumber,
          updatedAt: now,
        },
        { merge: true }
      );
      transaction.create(registrationRef, {
        registrationId,
        submissionId: submissionRef.id,
        submissionPurpose: "tech_research",
        createdAt: now,
      });
      transaction.create(submissionRef, {
        registrationId,
        title: payload.projectTitle,
        abstract: payload.abstract,
        affiliation: payload.institution,
        category: payload.researchArea,
        submissionPurpose: "tech_research",
        conferenceQuarter: null,
        conferenceAwardIntent: null,
        authorId: user.uid,
        authorName,
        authorEmail,
        status: initialStatus,
        assignedEditorId: null,
        assignedEditorName: null,
        assignedReviewerId: null,
        assignedReviewerName: null,
        reviewDeadline: null,
        statusNote: null,
        lastEmailSent: null,
        lastEmailTemplate: "tech_research_submission_received",
        emailStatus: "pending",
        emailTimestamp: now,
        deliveryStatus: "queued",
        submittedAt: now,
        lastUpdatedAt: now,
        techResearchDetails: {
          projectEducationLevel: payload.projectEducationLevel,
          projectType: payload.projectType,
          country: payload.country,
          teamMembers: payload.projectType === "team" ? payload.teamMembers : [],
          researchQuestion: payload.researchQuestion,
          problemAddressed: payload.problemAddressed,
          methods: payload.methods,
          keyFindings: payload.keyFindings,
          technologiesUsed: payload.technologiesUsed,
          keywords: payload.keywords,
          repositoryUrl: payload.repositoryUrl || null,
          projectUrl: payload.projectUrl || null,
          videoUrl: payload.videoUrl || null,
          datasetUrl: payload.datasetUrl || null,
          declarations: payload.declarations,
          submissionFeeUsd: TECH_RESEARCH_SUBMISSION_FEE_USD,
          paymentStatus: "unpaid",
          supplementaryMaterial: payload.supplementaryMaterialUrl,
        },
      });
      transaction.create(submissionRef.collection("statusHistory").doc(), {
        registrationId,
        status: initialStatus,
        note: "Tech Research application received. Submission fee pending.",
        createdAt: now,
        changedById: user.uid,
        changedByName: "Author",
        changedByRole: "scholar",
      });
    });

    void import("@/lib/email/submission-notifications")
      .then(({ notificationQueue }) =>
        notificationQueue.enqueueAndProcess({
          submissionId: submissionRef.id,
          submission: {
            registrationId,
            title: payload.projectTitle,
            authorName,
            authorEmail,
            submissionPurpose: "tech_research",
            conferenceAwardIntent: null,
            submittedAt: now,
          },
          status: initialStatus,
          trigger: "create",
          createdBy: user.uid,
        })
      )
      .catch((emailError) => {
        console.error("[submissions/create-tech-research] email skipped/failed:", emailError);
      });

    return NextResponse.json({
      ok: true,
      submissionId: submissionRef.id,
      registrationId,
      submittedAt: now.toDate().toISOString(),
      paymentRequired: true,
      submissionFeeDisplay: TECH_RESEARCH_SUBMISSION_FEE_DISPLAY,
    });
  } catch (error) {
    console.error("[submissions/create-tech-research]", error);
    const message =
      error instanceof Error ? error.message : "Could not register Tech Research submission.";
    return jsonError(message, 500);
  }
}
