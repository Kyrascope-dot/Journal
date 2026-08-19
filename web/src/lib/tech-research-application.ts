import { TECH_RESEARCH_AREAS } from "@/lib/tech-research-hub-content";
import {
  isAllowedTechResearchPptReportFile,
  TECH_RESEARCH_PPT_REPORT_MAX_BYTES,
} from "@/lib/tech-research-config";

export const TECH_RESEARCH_SUBMISSION_DISCLAIMER =
  "Submission does not guarantee acceptance or publication. All submissions are subject to GCR's academic, ethical and editorial assessment.";

export const TECH_RESEARCH_APPLY_STEPS = [
  { id: 1, key: "project", label: "Project" },
  { id: 2, key: "applicant", label: "Applicant" },
  { id: 3, key: "research", label: "Research" },
  { id: 4, key: "materials", label: "Research Materials" },
  { id: 5, key: "declaration", label: "Declaration" },
  { id: 6, key: "review", label: "Review" },
] as const;

export type TechResearchApplyStepId = (typeof TECH_RESEARCH_APPLY_STEPS)[number]["id"];

export type ProjectType = "individual" | "team";

export type EducationLevel = "high_school" | "undergraduate" | "postgraduate" | "other";

export const EDUCATION_LEVEL_OPTIONS: { value: EducationLevel; label: string }[] = [
  { value: "high_school", label: "High school" },
  { value: "undergraduate", label: "Undergraduate" },
  { value: "postgraduate", label: "Postgraduate" },
  { value: "other", label: "Other" },
];

export const PROJECT_TYPE_OPTIONS: { value: ProjectType; label: string }[] = [
  { value: "individual", label: "Individual project" },
  { value: "team", label: "Team project" },
];

export const RESEARCH_AREA_OPTIONS = [...TECH_RESEARCH_AREAS];

export type TeamMember = {
  fullName: string;
  email: string;
  institution: string;
  role: string;
};

export type TechResearchApplicationForm = {
  projectTitle: string;
  researchArea: string;
  projectEducationLevel: EducationLevel | "";
  projectType: ProjectType | "";

  fullName: string;
  email: string;
  institution: string;
  country: string;
  teamMembers: TeamMember[];

  researchQuestion: string;
  abstract: string;
  problemAddressed: string;
  methods: string;
  keyFindings: string;
  technologiesUsed: string;
  keywords: string;

  /** Display name for the selected PPT / Report file (internal: supplementaryMaterial). */
  supplementaryFileName: string;
  repositoryUrl: string;
  projectUrl: string;
  videoUrl: string;
  datasetUrl: string;

  declarationOriginal: boolean;
  declarationCited: boolean;
  declarationContributors: boolean;
  declarationAiDisclosed: boolean;
  declarationPermission: boolean;
  declarationEthics: boolean;
};

export const EMPTY_TEAM_MEMBER: TeamMember = {
  fullName: "",
  email: "",
  institution: "",
  role: "",
};

export const INITIAL_TECH_RESEARCH_APPLICATION: TechResearchApplicationForm = {
  projectTitle: "",
  researchArea: "",
  projectEducationLevel: "",
  projectType: "",

  fullName: "",
  email: "",
  institution: "",
  country: "",
  teamMembers: [{ ...EMPTY_TEAM_MEMBER }],

  researchQuestion: "",
  abstract: "",
  problemAddressed: "",
  methods: "",
  keyFindings: "",
  technologiesUsed: "",
  keywords: "",

  supplementaryFileName: "",
  repositoryUrl: "",
  projectUrl: "",
  videoUrl: "",
  datasetUrl: "",

  declarationOriginal: false,
  declarationCited: false,
  declarationContributors: false,
  declarationAiDisclosed: false,
  declarationPermission: false,
  declarationEthics: false,
};

export const DECLARATION_ITEMS: {
  key: keyof Pick<
    TechResearchApplicationForm,
    | "declarationOriginal"
    | "declarationCited"
    | "declarationContributors"
    | "declarationAiDisclosed"
    | "declarationPermission"
    | "declarationEthics"
  >;
  label: string;
}[] = [
  { key: "declarationOriginal", label: "This work is original." },
  { key: "declarationCited", label: "All sources are appropriately cited." },
  {
    key: "declarationContributors",
    label: "All contributors are correctly identified.",
  },
  {
    key: "declarationAiDisclosed",
    label: "AI-assisted tools have been disclosed where applicable.",
  },
  {
    key: "declarationPermission",
    label: "I have permission to submit this work.",
  },
  {
    key: "declarationEthics",
    label: "I agree to GCR publication ethics and author policies.",
  },
];

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function isValidOptionalUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true;
  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function requireField(value: string, message: string): string | undefined {
  return value.trim() ? undefined : message;
}

export function educationLevelLabel(level: EducationLevel | ""): string {
  if (!level) return "—";
  return EDUCATION_LEVEL_OPTIONS.find((opt) => opt.value === level)?.label ?? level;
}

export function projectTypeLabel(type: ProjectType | ""): string {
  if (!type) return "—";
  return PROJECT_TYPE_OPTIONS.find((opt) => opt.value === type)?.label ?? type;
}

export type TechResearchStepValidationContext = {
  supplementaryFile?: File | null;
};

export function validateTechResearchStep(
  step: TechResearchApplyStepId,
  form: TechResearchApplicationForm,
  context: TechResearchStepValidationContext = {}
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (step === 1) {
    const title = requireField(form.projectTitle, "Project title is required.");
    if (title) errors.projectTitle = title;
    if (!form.researchArea) errors.researchArea = "Research area is required.";
    if (!form.projectEducationLevel) {
      errors.projectEducationLevel = "Education level is required.";
    }
    if (!form.projectType) errors.projectType = "Select individual or team project.";
  }

  if (step === 2) {
    const fullName = requireField(form.fullName, "Full name is required.");
    if (fullName) errors.fullName = fullName;
    if (!form.email.trim()) {
      errors.email = "Email is required.";
    } else if (!isValidEmail(form.email)) {
      errors.email = "Enter a valid email address.";
    }
    const institution = requireField(form.institution, "Institution is required.");
    if (institution) errors.institution = institution;
    const country = requireField(form.country, "Country is required.");
    if (country) errors.country = country;

    if (form.projectType === "team") {
      form.teamMembers.forEach((member, index) => {
        if (!member.fullName.trim()) {
          errors[`teamMembers.${index}.fullName`] = "Team member name is required.";
        }
        if (!member.email.trim()) {
          errors[`teamMembers.${index}.email`] = "Team member email is required.";
        } else if (!isValidEmail(member.email)) {
          errors[`teamMembers.${index}.email`] = "Enter a valid email address.";
        }
        if (!member.institution.trim()) {
          errors[`teamMembers.${index}.institution`] = "Team member institution is required.";
        }
      });
    }
  }

  if (step === 3) {
    const fields: { key: keyof TechResearchApplicationForm; message: string }[] = [
      { key: "researchQuestion", message: "Research question or problem is required." },
      { key: "abstract", message: "Abstract is required." },
      { key: "problemAddressed", message: "Problem being addressed is required." },
      { key: "methods", message: "Methods are required." },
      { key: "keyFindings", message: "Key findings or results are required." },
      { key: "technologiesUsed", message: "Technologies or tools used are required." },
      { key: "keywords", message: "Keywords are required." },
    ];
    for (const field of fields) {
      const value = form[field.key];
      if (typeof value === "string" && !value.trim()) {
        errors[field.key] = field.message;
      }
    }
    if (form.abstract.trim() && form.abstract.trim().split(/\s+/).length > 500) {
      errors.abstract = "Abstract should be 500 words or fewer.";
    }
  }

  if (step === 4) {
    const file = context.supplementaryFile ?? null;
    if (!file) {
      errors.supplementaryFileName = "Select a PPT / Report file to continue.";
    } else if (!isAllowedTechResearchPptReportFile(file)) {
      errors.supplementaryFileName =
        "Upload a PowerPoint (.ppt, .pptx), Word (.doc, .docx), or PDF (.pdf) file.";
    } else if (file.size > TECH_RESEARCH_PPT_REPORT_MAX_BYTES) {
      errors.supplementaryFileName = "File must be 25 MB or smaller.";
    }

    const urlFields: { key: keyof TechResearchApplicationForm; label: string }[] = [
      { key: "repositoryUrl", label: "Repository URL" },
      { key: "projectUrl", label: "Project or demo URL" },
      { key: "videoUrl", label: "Video demonstration URL" },
      { key: "datasetUrl", label: "Dataset URL" },
    ];
    for (const field of urlFields) {
      const value = form[field.key];
      if (typeof value === "string" && !isValidOptionalUrl(value)) {
        errors[field.key] = `${field.label} must be a valid http or https URL.`;
      }
    }
  }

  if (step === 5) {
    for (const item of DECLARATION_ITEMS) {
      if (!form[item.key]) {
        errors[item.key] = "This declaration is required before you can continue.";
      }
    }
  }

  return errors;
}

export function validateTechResearchApplication(
  form: TechResearchApplicationForm,
  context: TechResearchStepValidationContext = {}
): Record<string, string> {
  let errors: Record<string, string> = {};
  for (const step of TECH_RESEARCH_APPLY_STEPS) {
    if (step.id === 6) continue;
    errors = { ...errors, ...validateTechResearchStep(step.id, form, context) };
  }
  return errors;
}

export type TechResearchSubmissionPayload = Omit<
  TechResearchApplicationForm,
  | "supplementaryFileName"
  | "declarationOriginal"
  | "declarationCited"
  | "declarationContributors"
  | "declarationAiDisclosed"
  | "declarationPermission"
  | "declarationEthics"
> & {
  declarations: {
    original: boolean;
    cited: boolean;
    contributors: boolean;
    aiDisclosed: boolean;
    permission: boolean;
    ethics: boolean;
  };
};

export function buildTechResearchSubmissionPayload(
  form: TechResearchApplicationForm
): TechResearchSubmissionPayload {
  return {
    projectTitle: form.projectTitle.trim(),
    researchArea: form.researchArea,
    projectEducationLevel: form.projectEducationLevel,
    projectType: form.projectType,
    fullName: form.fullName.trim(),
    email: form.email.trim(),
    institution: form.institution.trim(),
    country: form.country.trim(),
    teamMembers: form.teamMembers.map((member) => ({
      fullName: member.fullName.trim(),
      email: member.email.trim(),
      institution: member.institution.trim(),
      role: member.role.trim(),
    })),
    researchQuestion: form.researchQuestion.trim(),
    abstract: form.abstract.trim(),
    problemAddressed: form.problemAddressed.trim(),
    methods: form.methods.trim(),
    keyFindings: form.keyFindings.trim(),
    technologiesUsed: form.technologiesUsed.trim(),
    keywords: form.keywords.trim(),
    repositoryUrl: form.repositoryUrl.trim(),
    projectUrl: form.projectUrl.trim(),
    videoUrl: form.videoUrl.trim(),
    datasetUrl: form.datasetUrl.trim(),
    declarations: {
      original: form.declarationOriginal,
      cited: form.declarationCited,
      contributors: form.declarationContributors,
      aiDisclosed: form.declarationAiDisclosed,
      permission: form.declarationPermission,
      ethics: form.declarationEthics,
    },
  };
}
