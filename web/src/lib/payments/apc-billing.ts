import { isKnownCountry } from "@/lib/countries";

/**
 * APC Payment and Billing Details Form — completed by the author before paying
 * the Article Processing Charge. Shared by the form (client) and the server
 * routes (validation, storage, editorial-office email).
 */

export const APC_FORM_TITLE = "APC Payment and Billing Details Form";

export type ApcPayerType =
  | "author"
  | "educational_institution"
  | "company"
  | "individual"
  | "other";

export const APC_PAYER_TYPE_OPTIONS: { value: ApcPayerType; label: string }[] = [
  { value: "author", label: "Author personally" },
  { value: "educational_institution", label: "School / University / Educational Institution" },
  { value: "company", label: "Company / Organisation" },
  { value: "individual", label: "Parent / Guardian / Another Individual" },
  { value: "other", label: "Other" },
];

export type ApcRecipientType =
  | "individual"
  | "educational_institution"
  | "company"
  | "other_organisation";

export const APC_RECIPIENT_TYPE_OPTIONS: { value: ApcRecipientType; label: string }[] = [
  { value: "individual", label: "Individual" },
  { value: "educational_institution", label: "Educational Institution" },
  { value: "company", label: "Company / Business" },
  { value: "other_organisation", label: "Other Organisation" },
];

export type ApcGstRegistration = "yes" | "no" | "not_applicable";

export const APC_GST_REGISTRATION_OPTIONS: { value: ApcGstRegistration; label: string }[] = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "not_applicable", label: "Not applicable — overseas recipient" },
];

/** Section 5 statements; every one must be confirmed. */
export const APC_DECLARATIONS = [
  {
    key: "accurate",
    text: "I confirm that the information provided in this form is accurate and complete.",
  },
  {
    key: "authorised",
    text: "I confirm that I am authorised to make this payment or provide these billing details.",
  },
  {
    key: "relatesToManuscript",
    text: "I confirm that the payment relates to my accepted manuscript submitted to Global Confluence Review.",
  },
  {
    key: "dataUse",
    text: "I understand that the information provided may be used for payment processing, invoice generation, accounting, payment reconciliation, and applicable legal and tax compliance.",
  },
  {
    key: "policies",
    text: "I acknowledge the applicable GCR Privacy Policy and Terms and Conditions.",
  },
] as const;

export type ApcDeclarationKey = (typeof APC_DECLARATIONS)[number]["key"];

export type ApcBillingDetails = {
  // Section 1: Author and manuscript details
  correspondingAuthorName: string;
  correspondingAuthorEmail: string;
  manuscriptId: string | null;
  manuscriptTitle: string | null;
  authorCountry: string;
  institution: string | null;
  // Section 2: Payer and invoice details
  payerType: ApcPayerType;
  invoiceRecipientName: string;
  invoiceRecipientType: ApcRecipientType;
  billingEmail: string;
  billingAddress: string;
  billingCity: string;
  billingState: string;
  billingPostalCode: string | null;
  billingCountry: string;
  payerName: string | null;
  payerRelationship: string | null;
  // Section 3: GST and tax information (optional)
  gstRegistered: ApcGstRegistration | null;
  gstin: string | null;
  gstLegalName: string | null;
  gstRegisteredAddress: string | null;
  // Section 5: Declarations (all confirmed)
  declarations: Record<ApcDeclarationKey, true>;
};

const EMAIL_PATTERN = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
/** 15-character GSTIN, e.g. 07AAACB1234C1Z5. */
const GSTIN_PATTERN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

export function normalizeGstin(value: string): string {
  return value.replace(/\s+/g, "").toUpperCase();
}

function text(value: unknown, maxLength: number): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function oneOf<T extends string>(value: unknown, options: { value: T }[]): T | null {
  return options.some((option) => option.value === value) ? (value as T) : null;
}

export type ApcBillingValidation =
  | { ok: true; details: ApcBillingDetails }
  | { ok: false; error: string };

export function validateApcBillingDetails(raw: unknown): ApcBillingValidation {
  const fail = (error: string): ApcBillingValidation => ({ ok: false, error });
  if (!isRecord(raw)) return fail(`Please complete the ${APC_FORM_TITLE}.`);

  const correspondingAuthorName = text(raw.correspondingAuthorName, 300);
  if (!correspondingAuthorName) {
    return fail("Please enter the full name of the corresponding author.");
  }

  const correspondingAuthorEmail = text(raw.correspondingAuthorEmail, 320);
  if (!EMAIL_PATTERN.test(correspondingAuthorEmail)) {
    return fail("Please enter a valid email address for the corresponding author.");
  }

  const authorCountry = text(raw.authorCountry, 100);
  if (!isKnownCountry(authorCountry)) return fail("Please select the country of the author.");

  const payerType = oneOf(raw.payerType, APC_PAYER_TYPE_OPTIONS);
  if (!payerType) return fail("Please select who is making the APC payment.");

  const invoiceRecipientName = text(raw.invoiceRecipientName, 300);
  if (!invoiceRecipientName) {
    return fail("Please enter the full legal name of the invoice recipient.");
  }

  const invoiceRecipientType = oneOf(raw.invoiceRecipientType, APC_RECIPIENT_TYPE_OPTIONS);
  if (!invoiceRecipientType) return fail("Please select the invoice recipient type.");

  const billingEmail = text(raw.billingEmail, 320);
  if (!EMAIL_PATTERN.test(billingEmail)) {
    return fail("Please enter a valid billing email address.");
  }

  const billingAddress = text(raw.billingAddress, 1000);
  if (!billingAddress) return fail("Please enter the full billing address.");

  const billingCity = text(raw.billingCity, 200);
  if (!billingCity) return fail("Please enter the city.");

  const billingState = text(raw.billingState, 200);
  if (!billingState) return fail("Please enter the state / province / region.");

  const billingCountry = text(raw.billingCountry, 100);
  if (!isKnownCountry(billingCountry)) {
    return fail("Please select the country of the billing address.");
  }

  // Section 3 is optional; GST details are required only when registered.
  const gstRegistered = oneOf(raw.gstRegistered, APC_GST_REGISTRATION_OPTIONS);
  let gstin: string | null = null;
  let gstLegalName: string | null = null;
  let gstRegisteredAddress: string | null = null;
  if (gstRegistered === "yes") {
    gstin = normalizeGstin(text(raw.gstin, 30));
    if (!GSTIN_PATTERN.test(gstin)) {
      return fail("Please enter a valid 15-character GSTIN (for example 07AAACB1234C1Z5).");
    }
    gstLegalName = text(raw.gstLegalName, 300);
    if (!gstLegalName) {
      return fail("Please enter the legal business name as registered under GST.");
    }
    gstRegisteredAddress = text(raw.gstRegisteredAddress, 1000);
    if (!gstRegisteredAddress) return fail("Please enter the registered business address.");
  }

  const rawDeclarations = isRecord(raw.declarations) ? raw.declarations : {};
  const declarations = {} as Record<ApcDeclarationKey, true>;
  for (const declaration of APC_DECLARATIONS) {
    if (rawDeclarations[declaration.key] !== true) {
      return fail("Please confirm all the declarations in Section 5 before submitting the form.");
    }
    declarations[declaration.key] = true;
  }

  return {
    ok: true,
    details: {
      correspondingAuthorName,
      correspondingAuthorEmail,
      manuscriptId: text(raw.manuscriptId, 64) || null,
      manuscriptTitle: text(raw.manuscriptTitle, 500) || null,
      authorCountry,
      institution: text(raw.institution, 300) || null,
      payerType,
      invoiceRecipientName,
      invoiceRecipientType,
      billingEmail,
      billingAddress,
      billingCity,
      billingState,
      billingPostalCode: text(raw.billingPostalCode, 30) || null,
      billingCountry,
      payerName: text(raw.payerName, 300) || null,
      payerRelationship: text(raw.payerRelationship, 300) || null,
      gstRegistered,
      gstin,
      gstLegalName,
      gstRegisteredAddress,
      declarations,
    },
  };
}

const labelOf = <T extends string>(options: { value: T; label: string }[], value: T | null) =>
  options.find((option) => option.value === value)?.label ?? "—";

/** Section / label / value rows, for the editorial-office email and summaries. */
export function apcBillingRows(
  details: ApcBillingDetails,
): { section: string; label: string; value: string }[] {
  const author = "Author and manuscript details";
  const payer = "Payer and invoice details";
  const gst = "GST and tax information";
  const rows = [
    { section: author, label: "Corresponding author", value: details.correspondingAuthorName },
    { section: author, label: "Author email", value: details.correspondingAuthorEmail },
    { section: author, label: "Manuscript ID", value: details.manuscriptId ?? "Not provided" },
    { section: author, label: "Manuscript title", value: details.manuscriptTitle ?? "Not provided" },
    { section: author, label: "Country of author", value: details.authorCountry },
    {
      section: author,
      label: "Institution / School / University",
      value: details.institution ?? "Not provided",
    },
    {
      section: payer,
      label: "Who is making the APC payment",
      value: labelOf(APC_PAYER_TYPE_OPTIONS, details.payerType),
    },
    { section: payer, label: "Invoice recipient (legal name)", value: details.invoiceRecipientName },
    {
      section: payer,
      label: "Invoice recipient type",
      value: labelOf(APC_RECIPIENT_TYPE_OPTIONS, details.invoiceRecipientType),
    },
    { section: payer, label: "Billing email", value: details.billingEmail },
    { section: payer, label: "Billing address", value: details.billingAddress },
    { section: payer, label: "City", value: details.billingCity },
    { section: payer, label: "State / Province / Region", value: details.billingState },
    {
      section: payer,
      label: "Postal code / PIN code",
      value: details.billingPostalCode ?? "Not provided",
    },
    { section: payer, label: "Country of billing address", value: details.billingCountry },
    {
      section: payer,
      label: "Payer, if different from the author",
      value: details.payerName ?? "Not provided",
    },
    {
      section: payer,
      label: "Relationship of payer to author",
      value: details.payerRelationship ?? "Not provided",
    },
    {
      section: gst,
      label: "Invoice recipient registered under GST in India",
      value: details.gstRegistered
        ? labelOf(APC_GST_REGISTRATION_OPTIONS, details.gstRegistered)
        : "Not answered",
    },
  ];
  if (details.gstRegistered === "yes") {
    rows.push(
      { section: gst, label: "GSTIN", value: details.gstin ?? "—" },
      { section: gst, label: "Legal business name (GST)", value: details.gstLegalName ?? "—" },
      {
        section: gst,
        label: "Registered business address",
        value: details.gstRegisteredAddress ?? "—",
      },
    );
  }
  return rows;
}
