"use client";

import Link from "next/link";
import { COUNTRIES, HOME_COUNTRY } from "@/lib/countries";
import { siteConfig } from "@/lib/site-config";
import {
  JOURNAL_AUTHOR_REGION_OPTIONS,
  JOURNAL_FUNDING_OPTIONS,
  JOURNAL_REVIEW_ROUTE_OPTIONS,
  RESEARCH_WORK_TYPES,
  journalDetailRows,
  type JournalAuthorRegion,
  type JournalFundingStatus,
  type JournalReviewRoute,
  type JournalSubmissionDetails,
} from "@/types/journal-submission";

type YesNo = "" | "yes" | "no";

/** Form state for the journal-only questions ("" = not answered yet). */
export type JournalFormState = {
  authorRegion: JournalAuthorRegion | "";
  authorCountry: string;
  reviewRoute: JournalReviewRoute | "";
  researchWorkType: string;
  orcid: string;
  aiUsageUnder20Percent: YesNo;
  notUnderConsiderationElsewhere: boolean;
  wordCount: string;
  conflictOfInterest: YesNo;
  conflictOfInterestDetails: string;
  fundingStatus: JournalFundingStatus | "";
  supplementaryFiles: YesNo;
  feeWaiverRequested: YesNo;
  homeAddress: string;
};

export const EMPTY_JOURNAL_FORM: JournalFormState = {
  authorRegion: "",
  authorCountry: "",
  reviewRoute: "",
  researchWorkType: "",
  orcid: "",
  aiUsageUnder20Percent: "",
  notUnderConsiderationElsewhere: false,
  wordCount: "",
  conflictOfInterest: "",
  conflictOfInterestDetails: "",
  fundingStatus: "",
  supplementaryFiles: "",
  feeWaiverRequested: "",
  homeAddress: "",
};

const yesNoToBoolean = (value: YesNo): boolean | null =>
  value === "yes" ? true : value === "no" ? false : null;

/** Payload for the server; unanswered questions stay null so the server reports them. */
export function journalFormToPayload(
  form: JournalFormState,
  coAuthors: { name: string; country: string }[],
) {
  return {
    authorRegion: form.authorRegion || null,
    authorCountry: form.authorRegion === "national" ? HOME_COUNTRY : form.authorCountry,
    coAuthorCountries: coAuthors,
    reviewRoute: form.reviewRoute || null,
    researchWorkType: form.researchWorkType,
    orcid: form.orcid,
    aiUsageUnder20Percent: yesNoToBoolean(form.aiUsageUnder20Percent),
    notUnderConsiderationElsewhere: form.notUnderConsiderationElsewhere,
    wordCount: form.wordCount.trim() ? Number(form.wordCount) : null,
    conflictOfInterest: yesNoToBoolean(form.conflictOfInterest),
    conflictOfInterestDetails: form.conflictOfInterestDetails,
    fundingStatus: form.fundingStatus || null,
    supplementaryFiles: yesNoToBoolean(form.supplementaryFiles),
    feeWaiverRequested: yesNoToBoolean(form.feeWaiverRequested),
    homeAddress: form.homeAddress,
  };
}

type FieldProps = {
  value: JournalFormState;
  onChange: (patch: Partial<JournalFormState>) => void;
};

const labelClass = "block text-sm font-medium text-[var(--journal-heading)]";
const inputClass =
  "mt-1 w-full rounded border border-[var(--journal-border)] px-3 py-2 text-sm focus:border-[var(--journal-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--journal-accent)]";
const radioClass =
  "mt-0.5 border-[var(--journal-border)] text-[var(--journal-accent)] focus:ring-[var(--journal-accent)]";
const hintClass = "mt-1 text-xs leading-relaxed text-[var(--journal-muted)]";
const noteClass =
  "mt-2 rounded-md border border-[var(--journal-border)] bg-zinc-50 px-4 py-3 text-sm leading-relaxed text-[var(--journal-body)]";

function Required() {
  return <span className="text-red-500">*</span>;
}

function RadioGroup<T extends string>({
  name,
  legend,
  options,
  value,
  onChange,
  hint,
  inline = false,
}: {
  name: string;
  legend: string;
  options: { value: T; label: string }[];
  value: T | "";
  onChange: (value: T) => void;
  hint?: string;
  inline?: boolean;
}) {
  return (
    <fieldset>
      <legend className={labelClass}>
        {legend} <Required />
      </legend>
      {hint ? <p className={hintClass}>{hint}</p> : null}
      <div className={inline ? "mt-2 flex flex-wrap gap-x-6 gap-y-2" : "mt-2 space-y-2"}>
        {options.map((option, index) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-start gap-2 text-sm text-[var(--journal-body)]"
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              required={index === 0}
              className={radioClass}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

const YES_NO_OPTIONS: { value: "yes" | "no"; label: string }[] = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

export function CountrySelect({
  value,
  onChange,
  exclude,
  required = true,
  ariaLabel,
  className = inputClass,
}: {
  value: string;
  onChange: (country: string) => void;
  /** Country to leave out of the list (e.g. India for international authors). */
  exclude?: string;
  required?: boolean;
  ariaLabel?: string;
  className?: string;
}) {
  return (
    <select
      required={required}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={ariaLabel}
      className={className}
    >
      <option value="">Select country</option>
      {COUNTRIES.filter((country) => country !== exclude).map((country) => (
        <option key={country} value={country}>
          {country}
        </option>
      ))}
    </select>
  );
}

/** National author (India) / International author — asked first. */
export function JournalAuthorRegionField({ value, onChange }: FieldProps) {
  return (
    <RadioGroup
      name="journalAuthorRegion"
      legend="Author category"
      options={JOURNAL_AUTHOR_REGION_OPTIONS}
      value={value.authorRegion}
      onChange={(authorRegion) =>
        onChange({
          authorRegion,
          authorCountry:
            authorRegion === "national"
              ? HOME_COUNTRY
              : value.authorCountry === HOME_COUNTRY
                ? ""
                : value.authorCountry,
        })
      }
    />
  );
}

export function JournalAuthorCountryField({ value, onChange }: FieldProps) {
  const isNational = value.authorRegion === "national";
  return (
    <div>
      <label className={labelClass}>
        Country of author <Required />
      </label>
      {isNational ? (
        <input
          readOnly
          value={HOME_COUNTRY}
          className={`${inputClass} bg-zinc-50 text-[var(--journal-muted)]`}
        />
      ) : (
        <CountrySelect
          value={value.authorCountry}
          onChange={(authorCountry) => onChange({ authorCountry })}
          exclude={value.authorRegion === "international" ? HOME_COUNTRY : undefined}
        />
      )}
    </div>
  );
}

/** Route, type of research work, ORCID. */
export function JournalManuscriptFields({ value, onChange }: FieldProps) {
  return (
    <>
      <div>
        <RadioGroup
          name="journalReviewRoute"
          legend="Submit for publication via"
          options={JOURNAL_REVIEW_ROUTE_OPTIONS}
          value={value.reviewRoute}
          onChange={(reviewRoute) => onChange({ reviewRoute })}
        />
        <p className={noteClass}>
          APC charges are applicable only after full acceptance of the paper. See{" "}
          <Link
            href="/for-authors/publication-fees"
            target="_blank"
            className="font-medium text-[var(--journal-accent)] underline"
          >
            Publication fees
          </Link>{" "}
          for the Normal and Fast-track charges.
        </p>
      </div>
      <div>
        <label className={labelClass}>
          Type of research work <Required />
        </label>
        <select
          required
          value={value.researchWorkType}
          onChange={(e) => onChange({ researchWorkType: e.target.value })}
          className={inputClass}
        >
          <option value="">Select type of research work</option>
          {RESEARCH_WORK_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClass}>ORCID (Optional)</label>
        <input
          value={value.orcid}
          onChange={(e) => onChange({ orcid: e.target.value })}
          placeholder="0000-0000-0000-0000"
          inputMode="text"
          className={inputClass}
        />
      </div>
    </>
  );
}

/** Declarations and invoice address — asked after the abstract details. */
export function JournalDeclarationFields({ value, onChange }: FieldProps) {
  return (
    <>
      <div>
        <RadioGroup
          name="journalAiUsage"
          legend="Is AI usage in the paper less than 20%?"
          options={YES_NO_OPTIONS}
          value={value.aiUsageUnder20Percent}
          onChange={(aiUsageUnder20Percent) => onChange({ aiUsageUnder20Percent })}
          inline
        />
        <p className={noteClass}>
          <span className="font-medium">Note:</span> Please attach a Turnitin (or any other)
          report along with the blinded manuscript and title page in your email to{" "}
          <a
            href={`mailto:${siteConfig.email}`}
            className="font-medium text-[var(--journal-accent)] underline"
          >
            {siteConfig.email}
          </a>
          .
        </p>
      </div>
      <div>
        <label className={labelClass}>
          Total word count <Required />
        </label>
        <input
          required
          type="number"
          min={1}
          step={1}
          value={value.wordCount}
          onChange={(e) => onChange({ wordCount: e.target.value })}
          placeholder="e.g. 6500"
          className={inputClass}
        />
      </div>
      <div>
        <RadioGroup
          name="journalConflictOfInterest"
          legend="Conflict of interest"
          options={YES_NO_OPTIONS}
          value={value.conflictOfInterest}
          onChange={(conflictOfInterest) => onChange({ conflictOfInterest })}
          inline
        />
        {value.conflictOfInterest === "yes" ? (
          <textarea
            required
            rows={3}
            value={value.conflictOfInterestDetails}
            onChange={(e) => onChange({ conflictOfInterestDetails: e.target.value })}
            placeholder="Please give details of the conflict of interest"
            aria-label="Conflict of interest details"
            className={`${inputClass} mt-2`}
          />
        ) : null}
      </div>
      <RadioGroup
        name="journalFunding"
        legend="Funding declaration"
        options={JOURNAL_FUNDING_OPTIONS}
        value={value.fundingStatus}
        onChange={(fundingStatus) => onChange({ fundingStatus })}
        inline
      />
      <RadioGroup
        name="journalSupplementaryFiles"
        legend="Are you submitting any supplementary files along with the manuscript?"
        options={YES_NO_OPTIONS}
        value={value.supplementaryFiles}
        onChange={(supplementaryFiles) => onChange({ supplementaryFiles })}
        inline
      />
      <RadioGroup
        name="journalFeeWaiver"
        legend="Will you be considering to apply for a fee waiver in case your manuscript gets accepted?"
        hint="Note: meant for authors with no funding for research / lower income group only."
        options={YES_NO_OPTIONS}
        value={value.feeWaiverRequested}
        onChange={(feeWaiverRequested) => onChange({ feeWaiverRequested })}
        inline
      />
      <div>
        <label className={labelClass}>
          Home address of the author <Required />
        </label>
        <p className={hintClass}>For invoice purposes only.</p>
        <textarea
          required
          rows={3}
          value={value.homeAddress}
          onChange={(e) => onChange({ homeAddress: e.target.value })}
          placeholder="House / street, city, state, postal code, country"
          autoComplete="street-address"
          className={inputClass}
        />
      </div>
    </>
  );
}

/** Final confirmation — shown at the very end of the form, just above the submit button. */
export function JournalConfirmationField({ value, onChange }: FieldProps) {
  return (
    <label className="flex cursor-pointer items-start gap-2 text-sm text-[var(--journal-body)]">
      <input
        type="checkbox"
        required
        checked={value.notUnderConsiderationElsewhere}
        onChange={(e) => onChange({ notUnderConsiderationElsewhere: e.target.checked })}
        className="mt-0.5 rounded border-[var(--journal-border)] text-[var(--journal-accent)] focus:ring-[var(--journal-accent)]"
      />
      <span>
        I confirm that this manuscript is not under consideration at another journal.{" "}
        <Required />
      </span>
    </label>
  );
}

/** Read-only list of the journal answers, for dashboards. */
export function JournalSubmissionDetailsList({
  details,
  includeAddress,
  className = "",
}: {
  details: JournalSubmissionDetails;
  /** Author and admins only — the address is collected for invoices. */
  includeAddress: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-sm font-semibold text-[var(--journal-heading)]">
        Journal submission details
      </p>
      <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
        {journalDetailRows(details, { includeAddress }).map((row) => (
          <div key={row.label}>
            <dt className="font-medium text-[var(--journal-muted)]">{row.label}</dt>
            <dd className="whitespace-pre-line break-words">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
