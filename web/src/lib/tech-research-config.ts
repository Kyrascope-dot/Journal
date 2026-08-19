/** Tech Research Hub submission fee (USD). */
export const TECH_RESEARCH_SUBMISSION_FEE_USD = 80;

export const TECH_RESEARCH_SUBMISSION_FEE_DISPLAY = "USD 80";

/** Internal storage field for PPT / Report upload (user-facing label differs). */
export const TECH_RESEARCH_SUPPLEMENTARY_FIELD = "supplementaryMaterial" as const;

export const TECH_RESEARCH_PPT_REPORT_ACCEPT =
  ".ppt,.pptx,.doc,.docx,.pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf";

export const TECH_RESEARCH_PPT_REPORT_EXTENSIONS = [
  ".ppt",
  ".pptx",
  ".doc",
  ".docx",
  ".pdf",
] as const;

export const TECH_RESEARCH_PPT_REPORT_MAX_BYTES = 25 * 1024 * 1024;

export function isAllowedTechResearchPptReportFile(file: File): boolean {
  const lowerName = file.name.toLowerCase();
  return TECH_RESEARCH_PPT_REPORT_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
}

export function techResearchPptReportValidationError(file: File | null): string | undefined {
  if (!file) return "Select a PPT / Report file to continue.";
  if (!isAllowedTechResearchPptReportFile(file)) {
    return "Upload a PowerPoint (.ppt, .pptx), Word (.doc, .docx), or PDF (.pdf) file.";
  }
  if (file.size > TECH_RESEARCH_PPT_REPORT_MAX_BYTES) {
    return "File must be 25 MB or smaller.";
  }
  return undefined;
}
