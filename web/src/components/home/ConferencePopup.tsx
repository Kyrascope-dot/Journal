"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  conferenceRegistrationFees,
  howToRegisterSteps,
  importantConferenceDates,
  publicationOpportunityParagraphs,
} from "@/lib/conference-content";
import { siteConfig } from "@/lib/site-config";

const STORAGE_KEY = "gcr-conference-popup-2026-08-30";

export function ConferencePopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (window.localStorage.getItem(STORAGE_KEY)) return;

    const frame = window.requestAnimationFrame(() => setIsOpen(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        window.localStorage.setItem(STORAGE_KEY, "seen");
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  function closePopup() {
    window.localStorage.setItem(STORAGE_KEY, "seen");
    setIsOpen(false);
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/75 p-3 sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closePopup();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="conference-popup-title"
        className="relative grid max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-lg bg-white shadow-2xl lg:grid-cols-[minmax(320px,0.85fr)_minmax(420px,1.15fr)]"
      >
        <button
          type="button"
          onClick={closePopup}
          autoFocus
          aria-label="Close conference announcement"
          className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white text-2xl leading-none text-slate-900 shadow-md hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--journal-accent)]"
        >
          ×
        </button>

        <div className="space-y-4 bg-slate-100 p-3 sm:p-5">
          <Image
            src="/poster.jpeg"
            alt="Poster for the GCR International Multidisciplinary Conference on 30 August 2026"
            width={1024}
            height={1536}
            priority
            className="mx-auto h-auto w-full max-w-[560px]"
          />
          <Image
            src="/poster-colloqium.jpeg"
            alt="Poster for the GCR Colloquia / Research Workshop 2026"
            width={1070}
            height={1600}
            className="mx-auto h-auto w-full max-w-[560px]"
          />
        </div>

        <div className="p-5 pr-6 text-sm leading-relaxed text-[var(--journal-body)] sm:p-8 sm:pr-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--journal-accent)]">
            Conference announcement
          </p>
          <h2
            id="conference-popup-title"
            className="mt-2 font-serif text-2xl font-semibold text-[var(--journal-heading)] sm:text-3xl"
          >
            Call for Papers | GCR Conference Q3 2026
          </h2>

          <p className="mt-5 font-medium">
            Dear Researchers, Academicians, Industry Professionals, and Students,
          </p>
          <p className="mt-3">
            Global Confluence Review (GCR) invites original research for the International
            Multidisciplinary Conference 2026 and the complimentary GCR Colloquia/Workshop on 29
            August 2026.
          </p>

          <div className="mt-5 rounded border border-[var(--journal-border)] bg-slate-50 p-4">
            <p>
              <strong>Conference Date:</strong> 30 August 2026 (Online via Zoom)
            </p>
            <p className="mt-1">The Zoom link will be shared with registered participants.</p>
          </div>

          <h3 className="mt-6 font-serif text-lg font-semibold text-[var(--journal-heading)]">
            Important Dates
          </h3>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {importantConferenceDates.map((item) => (
              <li key={item.label}>
                {item.label}: {item.value}
              </li>
            ))}
          </ul>

          <h3 className="mt-6 font-serif text-lg font-semibold text-[var(--journal-heading)]">
            Registration fees
          </h3>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {conferenceRegistrationFees.map((fee) => (
              <li key={fee.label}>
                {fee.label}: {fee.amount}
              </li>
            ))}
          </ul>

          <h3 className="mt-6 font-serif text-lg font-semibold text-[var(--journal-heading)]">
            How to register
          </h3>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            {howToRegisterSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>

          <Link
            href="/conferences/register"
            onClick={closePopup}
            className="mt-5 inline-flex rounded bg-[var(--journal-accent)] px-5 py-2.5 font-medium text-white hover:opacity-95"
          >
            Register for the conference
          </Link>

          <h3 className="mt-6 font-serif text-lg font-semibold text-[var(--journal-heading)]">
            Publication opportunity
          </h3>
          {publicationOpportunityParagraphs.map((paragraph) => (
            <p key={paragraph} className="mt-2">
              {paragraph}
            </p>
          ))}

          <h3 className="mt-6 font-serif text-lg font-semibold text-[var(--journal-heading)]">
            Conference highlights
          </h3>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Distinguished speakers and research experts</li>
            <li>GCR Colloquia/Workshop (free for registered participants)</li>
            <li>Fireside Chat with Editors</li>
            <li>Best Paper &amp; Best Presenter Awards</li>
            <li>Separate digital certificates for conference and Colloquia</li>
            <li>Global networking opportunities</li>
          </ul>

          <div className="mt-6 border-t border-[var(--journal-border)] pt-5">
            <p>
              <strong>For Queries (Call/WhatsApp):</strong>{" "}
              <a className="text-[var(--journal-accent)] underline" href="tel:+917678560820">
                +91 7678560820
              </a>
            </p>
            <p className="mt-1">
              <strong>Email:</strong>{" "}
              <a
                className="break-all text-[var(--journal-accent)] underline"
                href={`mailto:${siteConfig.email}`}
              >
                {siteConfig.email}
              </a>
            </p>
            <p className="mt-1">
              <strong>Website:</strong>{" "}
              <a
                className="break-all text-[var(--journal-accent)] underline"
                href="https://www.globalconfluencereview.in"
              >
                globalconfluencereview.in
              </a>
            </p>
          </div>

          <p className="mt-6">We look forward to your valuable participation and contributions.</p>
        </div>
      </section>
    </div>
  );
}
