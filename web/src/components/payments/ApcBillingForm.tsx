"use client";

import Link from "next/link";
import { useState } from "react";
import { COUNTRIES } from "@/lib/countries";
import { requestSubmitApcBillingForm } from "@/lib/client/payments";
import {
  APC_DECLARATIONS,
  APC_FORM_TITLE,
  APC_GST_REGISTRATION_OPTIONS,
  APC_PAYER_TYPE_OPTIONS,
  APC_RECIPIENT_TYPE_OPTIONS,
  validateApcBillingDetails,
  type ApcDeclarationKey,
} from "@/lib/payments/apc-billing";
import {
  MANUSCRIPT_PLAN_DETAILS,
  type ManuscriptPaymentPlanId,
  type PaymentCheckoutBreakdown,
} from "@/lib/payments/plans";
import { siteConfig } from "@/lib/site-config";

/** Form state; "" means not answered yet. */
export type ApcBillingFormState = {
  correspondingAuthorName: string;
  correspondingAuthorEmail: string;
  manuscriptId: string;
  manuscriptTitle: string;
  authorCountry: string;
  institution: string;
  payerType: string;
  invoiceRecipientName: string;
  invoiceRecipientType: string;
  billingEmail: string;
  billingAddress: string;
  billingCity: string;
  billingState: string;
  billingPostalCode: string;
  billingCountry: string;
  payerName: string;
  payerRelationship: string;
  gstRegistered: string;
  gstin: string;
  gstLegalName: string;
  gstRegisteredAddress: string;
  declarations: Record<ApcDeclarationKey, boolean>;
};

export function emptyApcBillingForm(prefill: {
  name: string;
  email: string;
}): ApcBillingFormState {
  return {
    correspondingAuthorName: prefill.name,
    correspondingAuthorEmail: prefill.email,
    manuscriptId: "",
    manuscriptTitle: "",
    authorCountry: "",
    institution: "",
    payerType: "",
    invoiceRecipientName: "",
    invoiceRecipientType: "",
    billingEmail: prefill.email,
    billingAddress: "",
    billingCity: "",
    billingState: "",
    billingPostalCode: "",
    billingCountry: "",
    payerName: "",
    payerRelationship: "",
    gstRegistered: "",
    gstin: "",
    gstLegalName: "",
    gstRegisteredAddress: "",
    declarations: {
      accurate: false,
      authorised: false,
      relatesToManuscript: false,
      dataUse: false,
      policies: false,
    },
  };
}

const labelClass = "block text-sm font-medium text-[var(--journal-heading)]";
const inputClass =
  "mt-1 w-full rounded border border-[var(--journal-border)] px-3 py-2 text-sm focus:border-[var(--journal-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--journal-accent)]";
const hintClass = "mt-1 text-xs leading-relaxed text-[var(--journal-muted)]";
const radioClass =
  "mt-0.5 border-[var(--journal-border)] text-[var(--journal-accent)] focus:ring-[var(--journal-accent)]";

function Required() {
  return <span className="text-red-500">*</span>;
}

function Section({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-[var(--journal-border)] pt-6">
      <h3 className="font-serif text-lg font-semibold text-[var(--journal-heading)]">
        Section {number}: {title}
      </h3>
      <div className="mt-4 space-y-5">{children}</div>
    </section>
  );
}

function TextField({
  number,
  label,
  value,
  onChange,
  required = false,
  placeholder,
  type = "text",
  autoComplete,
  hint,
  multiline = false,
}: {
  number: number;
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  type?: "text" | "email";
  autoComplete?: string;
  hint?: string;
  multiline?: boolean;
}) {
  return (
    <label className="block">
      <span className={labelClass}>
        {number}. {label} {required ? <Required /> : null}
      </span>
      {multiline ? (
        <textarea
          rows={3}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={inputClass}
        />
      ) : (
        <input
          type={type}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={inputClass}
        />
      )}
      {hint ? <span className={`block ${hintClass}`}>{hint}</span> : null}
    </label>
  );
}

function CountryField({
  number,
  label,
  value,
  onChange,
}: {
  number: number;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className={labelClass}>
        {number}. {label} <Required />
      </span>
      <select
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      >
        <option value="">Select country</option>
        {COUNTRIES.map((country) => (
          <option key={country} value={country}>
            {country}
          </option>
        ))}
      </select>
    </label>
  );
}

function RadioField({
  number,
  name,
  label,
  options,
  value,
  onChange,
  required = false,
}: {
  number: number;
  name: string;
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <fieldset>
      <legend className={labelClass}>
        {number}. {label} {required ? <Required /> : null}
      </legend>
      <div className="mt-2 space-y-2">
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
              required={required && index === 0}
              className={radioClass}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** Section 4: read-only APC details for the route selected before the form. */
export function ApcPaymentSummary({
  planId,
  checkout,
}: {
  planId: ManuscriptPaymentPlanId;
  checkout: PaymentCheckoutBreakdown;
}) {
  const plan = MANUSCRIPT_PLAN_DETAILS[planId];
  const rows: { label: string; value: string; strong?: boolean }[] = [
    { label: "Author Category", value: plan.authorCategory },
    { label: "Publication Route", value: plan.route },
    { label: "APC Before Tax", value: checkout.displayBaseAmount },
    {
      label: "Applicable GST / Tax",
      value:
        checkout.gstRate && checkout.displayGstAmount
          ? `${checkout.displayGstAmount} (GST @ ${Math.round(checkout.gstRate * 100)}%)`
          : "Not applicable",
    },
    { label: "Approved Discount / Fee Waiver", value: "None approved" },
    { label: "Total Amount Payable", value: checkout.displayTotalAmount, strong: true },
    { label: "Payment Currency", value: checkout.currency },
  ];
  return (
    <dl className="divide-y divide-[var(--journal-border)] rounded border border-[var(--journal-border)] bg-zinc-50 text-sm">
      {rows.map((row) => (
        <div key={row.label} className="flex justify-between gap-4 px-4 py-2.5">
          <dt className="text-[var(--journal-body)]">{row.label}</dt>
          <dd
            className={
              row.strong
                ? "text-right text-base font-semibold text-[var(--journal-accent)]"
                : "text-right font-medium text-[var(--journal-heading)]"
            }
          >
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function ApcBillingForm({
  planId,
  checkout,
  value,
  onChange,
  onBack,
  onSubmitted,
}: {
  planId: ManuscriptPaymentPlanId;
  checkout: PaymentCheckoutBreakdown;
  value: ApcBillingFormState;
  onChange: (next: ApcBillingFormState) => void;
  onBack: () => void;
  onSubmitted: (billingFormId: string) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (patch: Partial<ApcBillingFormState>) => onChange({ ...value, ...patch });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const details = {
      ...value,
      gstRegistered: value.gstRegistered || null,
    };
    // Same rules as the server, so mistakes are reported before the request.
    const validation = validateApcBillingDetails(details);
    if (!validation.ok) {
      setError(validation.error);
      return;
    }

    setSaving(true);
    try {
      const saved = await requestSubmitApcBillingForm({ planId, details });
      onSubmitted(saved.billingFormId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the APC form.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--journal-accent)]">
          Global Confluence Review (GCR)
        </p>
        <h2 className="mt-1 font-serif text-xl font-semibold text-[var(--journal-heading)]">
          {APC_FORM_TITLE}
        </h2>
        <p className="mt-1 text-sm text-[var(--journal-muted)]">
          Publisher: {siteConfig.publisherOrganisation}
        </p>
        <div className="mt-4 rounded-md border border-[var(--journal-border)] bg-zinc-50 px-4 py-3 text-sm leading-relaxed text-[var(--journal-body)]">
          <p className="font-semibold text-[var(--journal-heading)]">Instructions for Authors</p>
          <p className="mt-2">
            Congratulations on the acceptance of your manuscript for publication in Global
            Confluence Review (GCR).
          </p>
          <p className="mt-2">
            Please complete this form before proceeding with your Article Processing Charge
            (APC) payment. The information will be used to process your payment, issue the
            appropriate invoice, and maintain accounting and tax records.
          </p>
          <p className="mt-2">
            Please ensure that your billing information is accurate, particularly if a school,
            university, institution, parent, or another individual is making the payment on your
            behalf.
          </p>
        </div>
      </header>

      <Section number={1} title="Author and Manuscript Details">
        <TextField
          number={1}
          label="Full Name of Corresponding Author"
          required
          value={value.correspondingAuthorName}
          onChange={(v) => set({ correspondingAuthorName: v })}
          placeholder="Enter full name"
          autoComplete="name"
        />
        <TextField
          number={2}
          label="Email Address of Corresponding Author"
          required
          type="email"
          value={value.correspondingAuthorEmail}
          onChange={(v) => set({ correspondingAuthorEmail: v })}
          placeholder="Enter email address"
          autoComplete="email"
        />
        <TextField
          number={3}
          label="Manuscript ID (Optional)"
          value={value.manuscriptId}
          onChange={(v) => set({ manuscriptId: v })}
          placeholder="Enter manuscript ID, if available"
        />
        <TextField
          number={4}
          label="Title of Accepted Manuscript (Optional)"
          value={value.manuscriptTitle}
          onChange={(v) => set({ manuscriptTitle: v })}
          placeholder="Enter full manuscript title, if available"
        />
        <CountryField
          number={5}
          label="Country of Author"
          value={value.authorCountry}
          onChange={(v) => set({ authorCountry: v })}
        />
        <TextField
          number={6}
          label="Institution / School / University (Optional)"
          value={value.institution}
          onChange={(v) => set({ institution: v })}
          placeholder="Enter institution name, if applicable"
          autoComplete="organization"
        />
      </Section>

      <Section number={2} title="Payer and Invoice Details">
        <RadioField
          number={7}
          name="apcPayerType"
          label="Who is making the APC payment?"
          required
          options={APC_PAYER_TYPE_OPTIONS}
          value={value.payerType}
          onChange={(v) => set({ payerType: v })}
        />
        <TextField
          number={8}
          label="Full Legal Name of the Invoice Recipient"
          required
          value={value.invoiceRecipientName}
          onChange={(v) => set({ invoiceRecipientName: v })}
          placeholder="Enter the name that should appear on the invoice"
        />
        <RadioField
          number={9}
          name="apcInvoiceRecipientType"
          label="Invoice Recipient Type"
          required
          options={APC_RECIPIENT_TYPE_OPTIONS}
          value={value.invoiceRecipientType}
          onChange={(v) => set({ invoiceRecipientType: v })}
        />
        <TextField
          number={10}
          label="Billing Email Address"
          required
          type="email"
          value={value.billingEmail}
          onChange={(v) => set({ billingEmail: v })}
          placeholder="Enter email address where the invoice should be sent"
        />
        <TextField
          number={11}
          label="Full Billing Address"
          required
          multiline
          value={value.billingAddress}
          onChange={(v) => set({ billingAddress: v })}
          placeholder="Enter complete address"
          autoComplete="street-address"
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            number={12}
            label="City"
            required
            value={value.billingCity}
            onChange={(v) => set({ billingCity: v })}
            placeholder="Enter city"
            autoComplete="address-level2"
          />
          <TextField
            number={13}
            label="State / Province / Region"
            required
            value={value.billingState}
            onChange={(v) => set({ billingState: v })}
            placeholder="Enter state or region"
            autoComplete="address-level1"
          />
          <TextField
            number={14}
            label="Postal Code / PIN Code"
            value={value.billingPostalCode}
            onChange={(v) => set({ billingPostalCode: v })}
            placeholder="Enter postal code, where applicable"
            autoComplete="postal-code"
          />
          <CountryField
            number={15}
            label="Country of Billing Address"
            value={value.billingCountry}
            onChange={(v) => set({ billingCountry: v })}
          />
        </div>
        <TextField
          number={16}
          label="Name of Payer, if Different from the Author"
          value={value.payerName}
          onChange={(v) => set({ payerName: v })}
          placeholder="Enter name, if applicable"
        />
        <TextField
          number={17}
          label="Relationship of Payer to Author, if Applicable"
          value={value.payerRelationship}
          onChange={(v) => set({ payerRelationship: v })}
          placeholder="For example: parent, university, employer or sponsor"
        />
      </Section>

      <Section number={3} title="GST and Tax Information (If Applicable)">
        <p className="text-sm leading-relaxed text-[var(--journal-body)]">
          Complete this section only if applicable to your billing circumstances. If it does not
          apply to you, you may skip it.
        </p>
        <RadioField
          number={18}
          name="apcGstRegistered"
          label="Is the invoice recipient registered under GST in India?"
          options={APC_GST_REGISTRATION_OPTIONS}
          value={value.gstRegistered}
          onChange={(v) => set({ gstRegistered: v })}
        />
        {value.gstRegistered === "yes" ? (
          <>
            <TextField
              number={19}
              label="GSTIN (Goods and Services Tax Identification Number)"
              required
              value={value.gstin}
              onChange={(v) => set({ gstin: v.toUpperCase() })}
              placeholder="Enter GSTIN"
              hint="15 characters, for example 07AAACB1234C1Z5."
            />
            <TextField
              number={20}
              label="Legal Business Name as Registered under GST"
              required
              value={value.gstLegalName}
              onChange={(v) => set({ gstLegalName: v })}
              placeholder="Enter registered legal name"
            />
            <TextField
              number={21}
              label="Registered Business Address"
              required
              multiline
              value={value.gstRegisteredAddress}
              onChange={(v) => set({ gstRegisteredAddress: v })}
              placeholder="Enter registered address"
            />
          </>
        ) : null}
        <p className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-950">
          <span className="font-semibold">Important:</span> Please provide the GST details of the
          invoice recipient, where applicable. If the invoice is to be issued to a university or
          institution, provide that institution&apos;s billing and GST details rather than the
          author&apos;s personal details.
        </p>
      </Section>

      <Section number={4} title="APC Payment Details">
        <p className="text-sm leading-relaxed text-[var(--journal-body)]">
          These details are set by the publication route you selected and cannot be edited.
        </p>
        <ApcPaymentSummary planId={planId} checkout={checkout} />
        <p className={hintClass}>
          If the Editorial Office has approved a discount or fee waiver for your manuscript and it
          is not shown above, please contact{" "}
          <a href={`mailto:${siteConfig.email}`} className="underline">
            {siteConfig.email}
          </a>{" "}
          before making the payment.
        </p>
      </Section>

      <Section number={5} title="Author Declarations and Consent">
        <p className="text-sm leading-relaxed text-[var(--journal-body)]">
          Please read and confirm the following statements before submitting the form.
        </p>
        <div className="space-y-3">
          {APC_DECLARATIONS.map((declaration) => (
            <label
              key={declaration.key}
              className="flex cursor-pointer items-start gap-2 text-sm leading-relaxed text-[var(--journal-body)]"
            >
              <input
                type="checkbox"
                required
                checked={value.declarations[declaration.key]}
                onChange={(e) =>
                  set({
                    declarations: {
                      ...value.declarations,
                      [declaration.key]: e.target.checked,
                    },
                  })
                }
                className="mt-0.5 rounded border-[var(--journal-border)] text-[var(--journal-accent)] focus:ring-[var(--journal-accent)]"
              />
              <span>
                {declaration.key === "policies" ? (
                  <>
                    I acknowledge the applicable GCR{" "}
                    <Link
                      href="/privacy-policy"
                      target="_blank"
                      className="font-medium text-[var(--journal-accent)] underline"
                    >
                      Privacy Policy
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/terms-and-conditions"
                      target="_blank"
                      className="font-medium text-[var(--journal-accent)] underline"
                    >
                      Terms and Conditions
                    </Link>
                    .
                  </>
                ) : (
                  declaration.text
                )}
              </span>
            </label>
          ))}
        </div>
      </Section>

      {error ? (
        <p
          role="alert"
          className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={saving}
          className="rounded border border-[var(--journal-border)] bg-white px-5 py-2.5 text-sm font-medium text-[var(--journal-heading)] hover:bg-zinc-50 disabled:opacity-50"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded bg-[var(--journal-accent)] px-5 py-2.5 text-sm font-medium text-white hover:opacity-95 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Submit form and continue to payment"}
        </button>
      </div>
    </form>
  );
}
