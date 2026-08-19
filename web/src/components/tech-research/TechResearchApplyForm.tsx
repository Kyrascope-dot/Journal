"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { TechResearchSubmissionPayment } from "@/components/tech-research/TechResearchSubmissionPayment";
import { useAuth } from "@/context/AuthContext";
import { submitTechResearchApplication } from "@/lib/client/tech-research-submission";
import {
  buildTechResearchSubmissionPayload,
  DECLARATION_ITEMS,
  EDUCATION_LEVEL_OPTIONS,
  INITIAL_TECH_RESEARCH_APPLICATION,
  PROJECT_TYPE_OPTIONS,
  RESEARCH_AREA_OPTIONS,
  TECH_RESEARCH_APPLY_STEPS,
  TECH_RESEARCH_SUBMISSION_DISCLAIMER,
  educationLevelLabel,
  projectTypeLabel,
  validateTechResearchApplication,
  validateTechResearchStep,
  type TechResearchApplicationForm,
  type TechResearchApplyStepId,
  type TeamMember,
} from "@/lib/tech-research-application";
import {
  TECH_RESEARCH_PRESENTATION_LINK_HINT,
  TECH_RESEARCH_PRESENTATION_LINK_PLACEHOLDER,
  TECH_RESEARCH_SUBMISSION_FEE_DISPLAY,
} from "@/lib/tech-research-config";
import { contentShell } from "@/lib/content-layout";

const inputClass =
  "mt-1 w-full rounded border border-[var(--journal-border)] px-3 py-2 text-sm text-[var(--journal-body)] focus:border-[var(--journal-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--journal-accent)]";
const inputErrorClass =
  "border-red-300 focus:border-red-500 focus:ring-red-500";
const labelClass = "block text-sm font-medium text-[var(--journal-heading)]";
const errorClass = "mt-1 text-sm text-red-600";
const sectionClass = "space-y-5";
const requiredMark = <span className="text-red-500"> *</span>;

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className={errorClass} role="alert">
      {message}
    </p>
  );
}

function FormField({
  id,
  label,
  required,
  error,
  children,
  hint,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  const errorId = `${id}-error`;
  const hintId = hint ? `${id}-hint` : undefined;
  const describedBy = [error ? errorId : null, hintId].filter(Boolean).join(" ") || undefined;

  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
        {required ? requiredMark : null}
      </label>
      {hint ? (
        <p id={hintId} className="mt-1 text-xs text-[var(--journal-muted)]">
          {hint}
        </p>
      ) : null}
      <div aria-describedby={describedBy}>{children}</div>
      <FieldError id={errorId} message={error} />
    </div>
  );
}

function ReviewSection({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-[var(--journal-border)] bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="font-serif text-lg font-semibold text-[var(--journal-heading)]">{title}</h3>
        <button
          type="button"
          onClick={onEdit}
          className="text-sm font-medium text-[var(--journal-accent)] hover:underline"
        >
          Edit
        </button>
      </div>
      <dl className="mt-4 space-y-3 text-sm">{children}</dl>
    </section>
  );
}

function ReviewItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="font-medium text-[var(--journal-heading)]">{label}</dt>
      <dd className="mt-1 whitespace-pre-wrap text-[var(--journal-body)]">{value || "—"}</dd>
    </div>
  );
}

function ProgressIndicator({ currentStep }: { currentStep: TechResearchApplyStepId }) {
  return (
    <nav aria-label="Submission progress" className="mb-8">
      <ol className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {TECH_RESEARCH_APPLY_STEPS.map((step) => {
          const status =
            step.id < currentStep ? "complete" : step.id === currentStep ? "current" : "upcoming";
          return (
            <li
              key={step.id}
              aria-current={status === "current" ? "step" : undefined}
              className={`rounded-lg border px-3 py-3 text-sm ${
                status === "current"
                  ? "border-[var(--journal-accent)] bg-[var(--journal-hero-bg)]"
                  : status === "complete"
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-[var(--journal-border)] bg-white"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--journal-muted)]">
                Step {step.id}
              </p>
              <p className="mt-1 font-medium text-[var(--journal-heading)]">{step.label}</p>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function StepProject({
  form,
  errors,
  updateField,
}: {
  form: TechResearchApplicationForm;
  errors: Record<string, string>;
  updateField: <K extends keyof TechResearchApplicationForm>(
    key: K,
    value: TechResearchApplicationForm[K]
  ) => void;
}) {
  return (
    <div className={sectionClass}>
      <FormField id="projectTitle" label="Project title" required error={errors.projectTitle}>
        <input
          id="projectTitle"
          type="text"
          value={form.projectTitle}
          onChange={(event) => updateField("projectTitle", event.target.value)}
          className={`${inputClass} ${errors.projectTitle ? inputErrorClass : ""}`}
          aria-invalid={errors.projectTitle ? true : undefined}
          autoComplete="off"
        />
      </FormField>

      <FormField id="researchArea" label="Research area" required error={errors.researchArea}>
        <select
          id="researchArea"
          value={form.researchArea}
          onChange={(event) => updateField("researchArea", event.target.value)}
          className={`${inputClass} ${errors.researchArea ? inputErrorClass : ""}`}
          aria-invalid={errors.researchArea ? true : undefined}
        >
          <option value="">Select a research area</option>
          {RESEARCH_AREA_OPTIONS.map((area) => (
            <option key={area} value={area}>
              {area}
            </option>
          ))}
        </select>
      </FormField>

      <FormField
        id="projectEducationLevel"
        label="Education level"
        required
        error={errors.projectEducationLevel}
        hint="The academic level this project represents."
      >
        <select
          id="projectEducationLevel"
          value={form.projectEducationLevel}
          onChange={(event) =>
            updateField(
              "projectEducationLevel",
              event.target.value as TechResearchApplicationForm["projectEducationLevel"]
            )
          }
          className={`${inputClass} ${errors.projectEducationLevel ? inputErrorClass : ""}`}
          aria-invalid={errors.projectEducationLevel ? true : undefined}
        >
          <option value="">Select education level</option>
          {EDUCATION_LEVEL_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </FormField>

      <fieldset>
        <legend className={labelClass}>
          Individual or team project
          {requiredMark}
        </legend>
        <div className="mt-2 space-y-2">
          {PROJECT_TYPE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-start gap-2 text-sm text-[var(--journal-body)]"
            >
              <input
                type="radio"
                name="projectType"
                value={option.value}
                checked={form.projectType === option.value}
                onChange={() => updateField("projectType", option.value)}
                className="mt-0.5 border-[var(--journal-border)] text-[var(--journal-accent)] focus:ring-[var(--journal-accent)]"
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
        <FieldError id="projectType-error" message={errors.projectType} />
      </fieldset>
    </div>
  );
}

function StepApplicant({
  form,
  errors,
  updateField,
  updateTeamMember,
  addTeamMember,
  removeTeamMember,
}: {
  form: TechResearchApplicationForm;
  errors: Record<string, string>;
  updateField: <K extends keyof TechResearchApplicationForm>(
    key: K,
    value: TechResearchApplicationForm[K]
  ) => void;
  updateTeamMember: (index: number, field: keyof TeamMember, value: string) => void;
  addTeamMember: () => void;
  removeTeamMember: (index: number) => void;
}) {
  return (
    <div className={sectionClass}>
      <FormField id="fullName" label="Full name" required error={errors.fullName}>
        <input
          id="fullName"
          type="text"
          value={form.fullName}
          onChange={(event) => updateField("fullName", event.target.value)}
          className={`${inputClass} ${errors.fullName ? inputErrorClass : ""}`}
          aria-invalid={errors.fullName ? true : undefined}
          autoComplete="name"
        />
      </FormField>

      <FormField id="email" label="Email" required error={errors.email}>
        <input
          id="email"
          type="email"
          value={form.email}
          onChange={(event) => updateField("email", event.target.value)}
          className={`${inputClass} ${errors.email ? inputErrorClass : ""}`}
          aria-invalid={errors.email ? true : undefined}
          autoComplete="email"
        />
      </FormField>

      <FormField
        id="institution"
        label="Institution / school / university"
        required
        error={errors.institution}
      >
        <input
          id="institution"
          type="text"
          value={form.institution}
          onChange={(event) => updateField("institution", event.target.value)}
          className={`${inputClass} ${errors.institution ? inputErrorClass : ""}`}
          aria-invalid={errors.institution ? true : undefined}
          autoComplete="organization"
        />
      </FormField>

      <FormField id="country" label="Country" required error={errors.country}>
        <input
          id="country"
          type="text"
          value={form.country}
          onChange={(event) => updateField("country", event.target.value)}
          className={`${inputClass} ${errors.country ? inputErrorClass : ""}`}
          aria-invalid={errors.country ? true : undefined}
          autoComplete="country-name"
        />
      </FormField>

      {form.projectType === "team" ? (
        <fieldset className="space-y-4 rounded-lg border border-[var(--journal-border)] p-4">
          <legend className="px-1 text-sm font-medium text-[var(--journal-heading)]">
            Team member information
          </legend>
          <p className="text-sm text-[var(--journal-muted)]">
            Add each additional team member. The primary applicant entered above should be listed
            here if they are part of the team.
          </p>
          {form.teamMembers.map((member, index) => (
            <div
              key={`team-member-${index}`}
              className="space-y-4 rounded-md border border-[var(--journal-border)] bg-zinc-50/70 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-[var(--journal-heading)]">
                  Team member {index + 1}
                </p>
                {form.teamMembers.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => removeTeamMember(index)}
                    className="text-sm text-[var(--journal-accent)] hover:underline"
                  >
                    Remove
                  </button>
                ) : null}
              </div>
              <FormField
                id={`team-member-name-${index}`}
                label="Full name"
                required
                error={errors[`teamMembers.${index}.fullName`]}
              >
                <input
                  id={`team-member-name-${index}`}
                  type="text"
                  value={member.fullName}
                  onChange={(event) => updateTeamMember(index, "fullName", event.target.value)}
                  className={`${inputClass} ${
                    errors[`teamMembers.${index}.fullName`] ? inputErrorClass : ""
                  }`}
                  aria-invalid={errors[`teamMembers.${index}.fullName`] ? true : undefined}
                />
              </FormField>
              <FormField
                id={`team-member-email-${index}`}
                label="Email"
                required
                error={errors[`teamMembers.${index}.email`]}
              >
                <input
                  id={`team-member-email-${index}`}
                  type="email"
                  value={member.email}
                  onChange={(event) => updateTeamMember(index, "email", event.target.value)}
                  className={`${inputClass} ${
                    errors[`teamMembers.${index}.email`] ? inputErrorClass : ""
                  }`}
                  aria-invalid={errors[`teamMembers.${index}.email`] ? true : undefined}
                />
              </FormField>
              <FormField
                id={`team-member-institution-${index}`}
                label="Institution"
                required
                error={errors[`teamMembers.${index}.institution`]}
              >
                <input
                  id={`team-member-institution-${index}`}
                  type="text"
                  value={member.institution}
                  onChange={(event) => updateTeamMember(index, "institution", event.target.value)}
                  className={`${inputClass} ${
                    errors[`teamMembers.${index}.institution`] ? inputErrorClass : ""
                  }`}
                  aria-invalid={errors[`teamMembers.${index}.institution`] ? true : undefined}
                />
              </FormField>
              <FormField id={`team-member-role-${index}`} label="Role or contribution">
                <input
                  id={`team-member-role-${index}`}
                  type="text"
                  value={member.role}
                  onChange={(event) => updateTeamMember(index, "role", event.target.value)}
                  className={inputClass}
                  placeholder="e.g. Software development, data analysis"
                />
              </FormField>
            </div>
          ))}
          <button
            type="button"
            onClick={addTeamMember}
            className="inline-flex rounded border border-[var(--journal-border)] bg-white px-3 py-1.5 text-sm font-medium text-[var(--journal-heading)] hover:bg-zinc-50"
          >
            Add team member
          </button>
        </fieldset>
      ) : null}
    </div>
  );
}

function StepResearch({
  form,
  errors,
  updateField,
}: {
  form: TechResearchApplicationForm;
  errors: Record<string, string>;
  updateField: <K extends keyof TechResearchApplicationForm>(
    key: K,
    value: TechResearchApplicationForm[K]
  ) => void;
}) {
  const textFields: {
    id: keyof TechResearchApplicationForm;
    label: string;
    rows: number;
    hint?: string;
  }[] = [
    {
      id: "researchQuestion",
      label: "Research question / problem",
      rows: 3,
    },
    {
      id: "abstract",
      label: "Abstract",
      rows: 6,
      hint: "Provide a concise summary of your project (500 words or fewer).",
    },
    {
      id: "problemAddressed",
      label: "Problem being addressed",
      rows: 4,
    },
    {
      id: "methods",
      label: "Methods",
      rows: 4,
    },
    {
      id: "keyFindings",
      label: "Key findings / results",
      rows: 4,
    },
    {
      id: "technologiesUsed",
      label: "Technologies / tools used",
      rows: 3,
    },
  ];

  return (
    <div className={sectionClass}>
      {textFields.map((field) => (
        <FormField
          key={field.id}
          id={field.id}
          label={field.label}
          required
          hint={field.hint}
          error={errors[field.id]}
        >
          <textarea
            id={field.id}
            rows={field.rows}
            value={form[field.id] as string}
            onChange={(event) => updateField(field.id, event.target.value)}
            className={`${inputClass} ${errors[field.id] ? inputErrorClass : ""}`}
            aria-invalid={errors[field.id] ? true : undefined}
          />
        </FormField>
      ))}

      <FormField
        id="keywords"
        label="Keywords"
        required
        hint="Separate keywords with commas."
        error={errors.keywords}
      >
        <input
          id="keywords"
          type="text"
          value={form.keywords}
          onChange={(event) => updateField("keywords", event.target.value)}
          className={`${inputClass} ${errors.keywords ? inputErrorClass : ""}`}
          aria-invalid={errors.keywords ? true : undefined}
          placeholder="machine learning, robotics, IoT"
        />
      </FormField>
    </div>
  );
}

function StepMaterials({
  form,
  errors,
  updateField,
}: {
  form: TechResearchApplicationForm;
  errors: Record<string, string>;
  updateField: <K extends keyof TechResearchApplicationForm>(
    key: K,
    value: TechResearchApplicationForm[K]
  ) => void;
}) {
  const urlFields: {
    id: keyof TechResearchApplicationForm;
    label: string;
    placeholder: string;
  }[] = [
    {
      id: "repositoryUrl",
      label: "GitHub / GitLab repository URL",
      placeholder: "https://github.com/your-team/project",
    },
    {
      id: "projectUrl",
      label: "Project / demo URL",
      placeholder: "https://example.com/demo",
    },
    {
      id: "videoUrl",
      label: "Video demonstration URL",
      placeholder: "https://youtube.com/watch?v=...",
    },
    {
      id: "datasetUrl",
      label: "Dataset URL",
      placeholder: "https://example.com/dataset",
    },
  ];

  return (
    <div className={sectionClass}>
      <FormField
        id="supplementaryMaterialUrl"
        label="PPT / Report"
        required
        hint={TECH_RESEARCH_PRESENTATION_LINK_HINT}
        error={errors.supplementaryMaterialUrl}
      >
        <input
          id="supplementaryMaterialUrl"
          type="url"
          value={form.supplementaryMaterialUrl}
          onChange={(event) => updateField("supplementaryMaterialUrl", event.target.value)}
          placeholder={TECH_RESEARCH_PRESENTATION_LINK_PLACEHOLDER}
          className={`${inputClass} ${errors.supplementaryMaterialUrl ? inputErrorClass : ""}`}
          aria-invalid={errors.supplementaryMaterialUrl ? true : undefined}
        />
      </FormField>
      {urlFields.map((field) => (
        <FormField
          key={field.id}
          id={field.id}
          label={field.label}
          error={errors[field.id]}
          hint="Optional"
        >
          <input
            id={field.id}
            type="url"
            value={form[field.id] as string}
            onChange={(event) => updateField(field.id, event.target.value)}
            placeholder={field.placeholder}
            className={`${inputClass} ${errors[field.id] ? inputErrorClass : ""}`}
            aria-invalid={errors[field.id] ? true : undefined}
          />
        </FormField>
      ))}
    </div>
  );
}

function StepDeclaration({
  form,
  errors,
  updateField,
}: {
  form: TechResearchApplicationForm;
  errors: Record<string, string>;
  updateField: <K extends keyof TechResearchApplicationForm>(
    key: K,
    value: TechResearchApplicationForm[K]
  ) => void;
}) {
  return (
    <div className={sectionClass}>
      <p className="text-sm leading-relaxed text-[var(--journal-body)]">
        Confirm each statement below before proceeding to review. Links to GCR policies are
        available on the{" "}
        <Link href="/for-authors/plagiarism-policy" className="text-[var(--journal-accent)] hover:underline">
          author policies
        </Link>{" "}
        and{" "}
        <Link href="/about/ethics" className="text-[var(--journal-accent)] hover:underline">
          publication ethics
        </Link>{" "}
        pages.
      </p>
      <fieldset className="space-y-3 rounded-lg border border-[var(--journal-border)] p-4">
        <legend className="px-1 text-sm font-medium text-[var(--journal-heading)]">
          Research integrity declaration
          {requiredMark}
        </legend>
        {DECLARATION_ITEMS.map((item) => (
          <label
            key={item.key}
            className="flex cursor-pointer items-start gap-3 rounded-md border border-transparent px-1 py-1 text-sm text-[var(--journal-body)] hover:bg-zinc-50"
          >
            <input
              type="checkbox"
              checked={form[item.key]}
              onChange={(event) => updateField(item.key, event.target.checked)}
              className="mt-0.5 rounded border-[var(--journal-border)] text-[var(--journal-accent)] focus:ring-[var(--journal-accent)]"
              aria-invalid={errors[item.key] ? true : undefined}
            />
            <span>{item.label}</span>
          </label>
        ))}
      </fieldset>
      {Object.keys(errors).some((key) => key.startsWith("declaration")) ? (
        <p className={errorClass} role="alert">
          All declaration checkboxes are required before you can continue.
        </p>
      ) : null}
    </div>
  );
}

function StepReview({
  form,
  goToStep,
}: {
  form: TechResearchApplicationForm;
  goToStep: (step: TechResearchApplyStepId) => void;
}) {
  return (
    <div className="space-y-5">
      <ReviewSection title="Project" onEdit={() => goToStep(1)}>
        <ReviewItem label="Project title" value={form.projectTitle} />
        <ReviewItem label="Research area" value={form.researchArea} />
        <ReviewItem
          label="Education level"
          value={educationLevelLabel(form.projectEducationLevel)}
        />
        <ReviewItem label="Project type" value={projectTypeLabel(form.projectType)} />
      </ReviewSection>

      <ReviewSection title="Applicant" onEdit={() => goToStep(2)}>
        <ReviewItem label="Full name" value={form.fullName} />
        <ReviewItem label="Email" value={form.email} />
        <ReviewItem label="Institution" value={form.institution} />
        <ReviewItem label="Country" value={form.country} />
        {form.projectType === "team" ? (
          <ReviewItem
            label="Team members"
            value={form.teamMembers
              .map(
                (member, index) =>
                  `${index + 1}. ${member.fullName} (${member.email}) — ${member.institution}${
                    member.role ? `; ${member.role}` : ""
                  }`
              )
              .join("\n")}
          />
        ) : null}
      </ReviewSection>

      <ReviewSection title="Research" onEdit={() => goToStep(3)}>
        <ReviewItem label="Research question / problem" value={form.researchQuestion} />
        <ReviewItem label="Abstract" value={form.abstract} />
        <ReviewItem label="Problem being addressed" value={form.problemAddressed} />
        <ReviewItem label="Methods" value={form.methods} />
        <ReviewItem label="Key findings / results" value={form.keyFindings} />
        <ReviewItem label="Technologies / tools used" value={form.technologiesUsed} />
        <ReviewItem label="Keywords" value={form.keywords} />
      </ReviewSection>

      <ReviewSection title="Research materials" onEdit={() => goToStep(4)}>
        <ReviewItem label="PPT / Report link" value={form.supplementaryMaterialUrl || "—"} />
        <ReviewItem label="Repository URL" value={form.repositoryUrl} />
        <ReviewItem label="Project / demo URL" value={form.projectUrl} />
        <ReviewItem label="Video demonstration URL" value={form.videoUrl} />
        <ReviewItem label="Dataset URL" value={form.datasetUrl} />
      </ReviewSection>

      <ReviewSection title="Declaration" onEdit={() => goToStep(5)}>
        <ReviewItem
          label="Research integrity"
          value={DECLARATION_ITEMS.map((item) => `✓ ${item.label}`).join("\n")}
        />
      </ReviewSection>
    </div>
  );
}

export function TechResearchApplyForm() {
  const formId = useId();
  const stepHeadingId = useId();
  const { user, loading: authLoading } = useAuth();
  const [step, setStep] = useState<TechResearchApplyStepId>(1);
  const [form, setForm] = useState<TechResearchApplicationForm>(
    INITIAL_TECH_RESEARCH_APPLICATION
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submissionResult, setSubmissionResult] = useState<{
    registrationId: string;
    submissionId: string;
  } | null>(null);

  const currentStepMeta = TECH_RESEARCH_APPLY_STEPS.find((item) => item.id === step)!;

  function updateField<K extends keyof TechResearchApplicationForm>(
    key: K,
    value: TechResearchApplicationForm[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key as string]) return current;
      const next = { ...current };
      delete next[key as string];
      return next;
    });
  }

  function updateTeamMember(index: number, field: keyof TeamMember, value: string) {
    setForm((current) => ({
      ...current,
      teamMembers: current.teamMembers.map((member, memberIndex) =>
        memberIndex === index ? { ...member, [field]: value } : member
      ),
    }));
    setErrors((current) => {
      const key = `teamMembers.${index}.${field}`;
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  function addTeamMember() {
    setForm((current) => ({
      ...current,
      teamMembers: [...current.teamMembers, { fullName: "", email: "", institution: "", role: "" }],
    }));
  }

  function removeTeamMember(index: number) {
    setForm((current) => ({
      ...current,
      teamMembers: current.teamMembers.filter((_, memberIndex) => memberIndex !== index),
    }));
  }

  function goToStep(nextStep: TechResearchApplyStepId) {
    setStep(nextStep);
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleContinue() {
    const stepErrors = validateTechResearchStep(step, form);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    goToStep((step + 1) as TechResearchApplyStepId);
  }

  function handleReviewSubmission() {
    const stepErrors = validateTechResearchStep(5, form);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    goToStep(6);
  }

  async function handleSubmit() {
    if (!user) {
      setSubmitError("Please sign in to submit your Tech Research application.");
      return;
    }

    const allErrors = validateTechResearchApplication(form);
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    try {
      const result = await submitTechResearchApplication(buildTechResearchSubmissionPayload(form));
      setSubmissionResult({
        registrationId: result.registrationId,
        submissionId: result.submissionId,
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Submission failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={`${contentShell} py-12 sm:py-16`}>
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-medium uppercase tracking-wide text-[var(--journal-accent)]">
          GCR Tech Research Hub
        </p>
        <h1 className="mt-3 font-serif text-3xl font-semibold text-[var(--journal-heading)]">
          Tech Research Submission
        </h1>
        <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-[var(--journal-body)]">
          Complete each step below to prepare your student research submission for editorial review.
          Submission fee: <span className="font-medium">{TECH_RESEARCH_SUBMISSION_FEE_DISPLAY}</span>.
        </p>

        {!authLoading && !user ? (
          <div className="mt-6 rounded-lg border border-[var(--journal-border)] bg-zinc-50 px-4 py-3 text-sm text-[var(--journal-body)]">
            <span className="font-medium text-[var(--journal-heading)]">Sign in required.</span>{" "}
            You must be signed in to submit.{" "}
            <Link href="/login?next=/tech-research/apply" className="font-medium text-[var(--journal-accent)] hover:underline">
              Sign in
            </Link>{" "}
            or{" "}
            <Link href="/register?next=/tech-research/apply" className="font-medium text-[var(--journal-accent)] hover:underline">
              create an account
            </Link>
            .
          </div>
        ) : null}

        <div
          className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-950"
          role="note"
        >
          {TECH_RESEARCH_SUBMISSION_DISCLAIMER}
        </div>

        {submissionResult ? (
          <div
            className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm leading-relaxed text-emerald-950"
            role="status"
          >
            <p className="font-medium text-emerald-900">Submission received</p>
            <p className="mt-2">
              Registration ID:{" "}
              <span className="font-semibold">{submissionResult.registrationId}</span>
            </p>
            <p className="mt-2">
              Your application has been saved. Complete the submission fee below to finalise your
              application.
            </p>
            <Link
              href={`/dashboard/acknowledgement/${submissionResult.submissionId}`}
              className="mt-2 inline-block font-medium text-[var(--journal-accent)] hover:underline"
            >
              View acknowledgement receipt
            </Link>
            <TechResearchSubmissionPayment registrationId={submissionResult.registrationId} />
          </div>
        ) : null}

        {submitError ? (
          <div className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {submitError}
          </div>
        ) : null}

        <ProgressIndicator currentStep={step} />

        <form
          id={formId}
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            if (step === 5) {
              handleReviewSubmission();
              return;
            }
            if (step === 6) {
              handleSubmit();
            }
          }}
          className="rounded-xl border border-[var(--journal-border)] bg-white p-6 sm:p-8"
        >
          <h2 id={stepHeadingId} className="font-serif text-2xl font-semibold text-[var(--journal-heading)]">
            Step {step}: {currentStepMeta.label}
          </h2>

          {Object.keys(errors).length > 0 ? (
            <div
              className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              role="alert"
            >
              Please correct the highlighted fields before continuing.
            </div>
          ) : null}

          <div className="mt-6">
            {step === 1 ? (
              <StepProject form={form} errors={errors} updateField={updateField} />
            ) : null}
            {step === 2 ? (
              <StepApplicant
                form={form}
                errors={errors}
                updateField={updateField}
                updateTeamMember={updateTeamMember}
                addTeamMember={addTeamMember}
                removeTeamMember={removeTeamMember}
              />
            ) : null}
            {step === 3 ? (
              <StepResearch form={form} errors={errors} updateField={updateField} />
            ) : null}
            {step === 4 ? (
              <StepMaterials form={form} errors={errors} updateField={updateField} />
            ) : null}
            {step === 5 ? (
              <StepDeclaration form={form} errors={errors} updateField={updateField} />
            ) : null}
            {step === 6 ? (
              <>
                <p className="mb-5 text-sm leading-relaxed text-[var(--journal-body)]">
                  Review your information carefully. Use Edit on any section to make changes before
                  submitting for editorial review. A {TECH_RESEARCH_SUBMISSION_FEE_DISPLAY} submission
                  fee applies after your application is received.
                </p>
                <StepReview form={form} goToStep={goToStep} />
              </>
            ) : null}
          </div>

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-[var(--journal-border)] pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-3">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => goToStep((step - 1) as TechResearchApplyStepId)}
                  className="inline-flex rounded border border-[var(--journal-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--journal-heading)] hover:bg-zinc-50"
                >
                  Back
                </button>
              ) : (
                <Link
                  href="/tech-research"
                  className="inline-flex rounded border border-[var(--journal-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--journal-heading)] hover:bg-zinc-50"
                >
                  Back to Tech Research Hub
                </Link>
              )}
            </div>

            <div className="flex flex-wrap gap-3 sm:justify-end">
              {step < 5 ? (
                <button
                  type="button"
                  onClick={handleContinue}
                  className="inline-flex rounded border border-[var(--journal-accent)] bg-[var(--journal-accent)] px-5 py-2 text-sm font-medium text-white hover:opacity-95"
                >
                  Save &amp; Continue
                </button>
              ) : null}
              {step === 5 ? (
                <button
                  type="submit"
                  className="inline-flex rounded border border-[var(--journal-accent)] bg-[var(--journal-accent)] px-5 py-2 text-sm font-medium text-white hover:opacity-95"
                >
                  Review Submission
                </button>
              ) : null}
              {step === 6 ? (
                <button
                  type="submit"
                  disabled={submitting || !user}
                  className="inline-flex rounded border border-[var(--journal-accent)] bg-[var(--journal-accent)] px-5 py-2 text-sm font-medium text-white hover:opacity-95 disabled:opacity-60"
                >
                  {submitting ? "Submitting…" : "Submit for Editorial Review"}
                </button>
              ) : null}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
