"use client";

import Image from "next/image";
import { editorialTeam } from "@/data/editorial";
import {
  colloquiaBenefits,
  colloquiaDetails,
  colloquiaExpertHighlights,
  colloquiaExpertIds,
  colloquiaParticipantGains,
  colloquiaTracks,
  colloquiaWhoCanParticipate,
  conferenceAwards,
  conferenceAwardsNotes,
  conferenceEditorEmail,
  conferenceFeeWaiverText,
  conferenceRegistrationFees,
  conferenceSchedule,
  conferenceSpeakers,
  conferenceTimezone,
  firesideChatTopics,
  howToRegisterSteps,
  importantConferenceDates,
  onlineConferenceBenefits,
  publicationOpportunityParagraphs,
} from "@/lib/conference-content";
import { featuredConference } from "@/lib/conference-config";

function EditorEmailLink() {
  return (
    <a
      href={`mailto:${conferenceEditorEmail}`}
      className="break-all text-[var(--journal-accent)] underline"
    >
      {conferenceEditorEmail}
    </a>
  );
}

export function ConferenceSpeakersSection() {
  return (
    <section id="speakers" className="mt-12 scroll-mt-24">
      <h2 className="font-serif text-xl font-semibold text-[var(--journal-heading)]">
        Speakers &amp; leadership
      </h2>
      <ul className="mt-6 space-y-4">
        {conferenceSpeakers.map((speaker) => (
          <li
            key={speaker.name}
            className="rounded-lg border border-[var(--journal-border)] p-4 text-[15px]"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--journal-accent)]">
              {speaker.role}
            </p>
            <p className="mt-1 font-semibold text-[var(--journal-heading)]">{speaker.name}</p>
            <p className="mt-1 text-[var(--journal-body)]">{speaker.affiliation}</p>
            {"lines" in speaker && speaker.lines
              ? speaker.lines.map((line) => (
                  <p key={line} className="mt-1 text-sm text-[var(--journal-muted)]">
                    {line}
                  </p>
                ))
              : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ConferenceScheduleSection() {
  return (
    <section id="schedule" className="mt-12 scroll-mt-24">
      <h2 className="font-serif text-xl font-semibold text-[var(--journal-heading)]">
        Conference schedule
      </h2>
      <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-medium text-[var(--journal-heading)]">Date</dt>
          <dd className="text-[var(--journal-body)]">{featuredConference.datesLabel}</dd>
        </div>
        <div>
          <dt className="font-medium text-[var(--journal-heading)]">Timezone</dt>
          <dd className="text-[var(--journal-body)]">{conferenceTimezone}</dd>
        </div>
      </dl>
      <ol className="mt-6 space-y-3">
        {conferenceSchedule.map((slot) => (
          <li
            key={slot.time}
            className="rounded-lg border border-[var(--journal-border)] px-4 py-3 text-[15px]"
          >
            <p className="font-medium text-[var(--journal-heading)]">{slot.time}</p>
            <p className="mt-1 text-[var(--journal-body)]">{slot.title}</p>
            {"note" in slot && slot.note ? (
              <p className="mt-1 text-sm text-[var(--journal-muted)]">+ {slot.note}</p>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}

export function ConferenceFeesSection() {
  return (
    <section id="fees" className="mt-12 scroll-mt-24">
      <h2 className="font-serif text-xl font-semibold text-[var(--journal-heading)]">
        Registration fees
      </h2>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-[15px] text-[var(--journal-body)]">
        {conferenceRegistrationFees.map((fee) => (
          <li key={fee.label}>
            <strong>{fee.label}</strong>
            {"breakdown" in fee && fee.breakdown ? (
              <ul className="mt-1 list-disc space-y-0.5 pl-5 font-normal">
                {fee.breakdown.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            ) : (
              <>: {fee.amount}</>
            )}
          </li>
        ))}
      </ul>
      <p className="mt-4 text-[15px] leading-relaxed text-[var(--journal-body)]">
        {conferenceFeeWaiverText}
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-[var(--journal-body)]">
        Students seeking financial assistance should email the Editor at <EditorEmailLink />.
      </p>
    </section>
  );
}

export function ImportantDatesSection() {
  return (
    <section id="important-dates" className="mt-12 scroll-mt-24">
      <h2 className="font-serif text-xl font-semibold text-[var(--journal-heading)]">
        Important dates
      </h2>
      <ul className="mt-4 space-y-2 text-[15px] text-[var(--journal-body)]">
        {importantConferenceDates.map((item) => (
          <li key={item.label}>
            <strong>{item.label}:</strong> {item.value}
          </li>
        ))}
      </ul>
      <p className="mt-4 text-[15px] text-[var(--journal-body)]">
        The Zoom link will be shared with registered participants.
      </p>
    </section>
  );
}

export function HowToRegisterSection() {
  return (
    <section id="how-to-register" className="mt-12 scroll-mt-24">
      <h2 className="font-serif text-xl font-semibold text-[var(--journal-heading)]">
        How to register
      </h2>
      <ol className="mt-4 list-decimal space-y-2 pl-5 text-[15px] text-[var(--journal-body)]">
        {howToRegisterSteps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </section>
  );
}

export function PublicationOpportunitySection() {
  return (
    <section id="publication" className="mt-12 scroll-mt-24">
      <h2 className="font-serif text-xl font-semibold text-[var(--journal-heading)]">
        Publication opportunity
      </h2>
      {publicationOpportunityParagraphs.map((paragraph) => (
        <p key={paragraph} className="mt-4 text-[15px] leading-relaxed text-[var(--journal-body)]">
          {paragraph}
        </p>
      ))}
    </section>
  );
}

export function AwardsAndCertificatesSection() {
  return (
    <section id="awards" className="mt-12 scroll-mt-24">
      <h2 className="font-serif text-xl font-semibold text-[var(--journal-heading)]">
        Awards &amp; certificates
      </h2>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-[15px] text-[var(--journal-body)]">
        {conferenceAwards.map((award) => (
          <li key={award}>{award}</li>
        ))}
      </ul>
      {conferenceAwardsNotes.map((note) => (
        <p key={note} className="mt-4 text-[15px] leading-relaxed text-[var(--journal-body)]">
          {note}
        </p>
      ))}
    </section>
  );
}

export function OnlineConferenceBenefitsSection() {
  return (
    <section id="online-benefits" className="mt-12 scroll-mt-24">
      <h2 className="font-serif text-xl font-semibold text-[var(--journal-heading)]">
        Online conference benefits
      </h2>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-[15px] text-[var(--journal-body)]">
        {onlineConferenceBenefits.map((benefit) => (
          <li key={benefit}>{benefit}</li>
        ))}
      </ul>
    </section>
  );
}

export function ColloquiaSection() {
  const experts = colloquiaExpertIds
    .map((id) => editorialTeam.find((m) => m.id === id))
    .filter((m): m is (typeof editorialTeam)[number] => Boolean(m));

  return (
    <section id="colloquia" className="mt-16 scroll-mt-24 border-t border-[var(--journal-border)] pt-12">
      <h2 className="font-serif text-2xl font-semibold text-[var(--journal-heading)]">
        {colloquiaDetails.title}
      </h2>
      <p className="mt-2 text-lg text-[var(--journal-body)]">{colloquiaDetails.subtitle}</p>
      <ul className="mt-4 space-y-1 text-[15px] text-[var(--journal-body)]">
        <li>
          <strong>Date:</strong> {colloquiaDetails.date}
        </li>
        <li>
          <strong>Time:</strong> {colloquiaDetails.time}
        </li>
        <li>
          <strong>Mode:</strong> {colloquiaDetails.mode}
        </li>
        <li>
          <strong>Duration:</strong> {colloquiaDetails.duration}
        </li>
      </ul>
      <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-[var(--journal-accent)]">
        {colloquiaDetails.feeLabel}
      </p>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-[15px] text-[var(--journal-body)]">
        {colloquiaDetails.points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>

      <h3 className="mt-10 font-serif text-lg font-semibold text-[var(--journal-heading)]">
        Fireside Chat with Editors
      </h3>
      <p className="mt-3 text-[15px] text-[var(--journal-body)]">
        Following the Colloquia, an exclusive interactive Fireside Chat with Editors will provide
        participants with an opportunity to ask questions and engage in discussion on:
      </p>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-[15px] text-[var(--journal-body)]">
        {firesideChatTopics.map((topic) => (
          <li key={topic}>{topic}</li>
        ))}
      </ul>

      <h3 className="mt-10 font-serif text-lg font-semibold text-[var(--journal-heading)]">
        Distinguished research experts
      </h3>
      <ul className="mt-6 space-y-6">
        {experts.map((expert) => {
          const highlights = colloquiaExpertHighlights[expert.id as (typeof colloquiaExpertIds)[number]];
          const displayName =
            expert.id === "vishal-dagar" ? "Assoc. Prof. Vishal Dagar" : expert.name;
          const displayQual =
            expert.id === "mariam-aloulou"
              ? "Assoc. Prof. Mariam Aloulou"
              : expert.qualification;

          return (
            <li
              key={expert.id}
              className="flex flex-col gap-4 rounded-lg border border-[var(--journal-border)] p-4 sm:flex-row"
            >
              <Image
                src={expert.imageSrc ?? "/editorial/placeholder-avatar.svg"}
                alt={displayName}
                width={96}
                height={96}
                className="h-24 w-24 shrink-0 rounded-full object-cover"
              />
              <div className="min-w-0 text-[15px]">
                <p className="font-semibold text-[var(--journal-heading)]">{displayName}</p>
                <p className="mt-1 text-sm text-[var(--journal-muted)]">{displayQual}</p>
                {expert.designation ? (
                  <p className="mt-2 whitespace-pre-line text-sm text-[var(--journal-body)]">
                    {expert.designation.split("\n")[0]}
                  </p>
                ) : null}
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[var(--journal-body)]">
                  {highlights?.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
            </li>
          );
        })}
      </ul>

      <h3 className="mt-10 font-serif text-lg font-semibold text-[var(--journal-heading)]">
        Colloquia benefits
      </h3>
      <ul className="mt-4 space-y-4">
        {colloquiaBenefits.map((benefit) => (
          <li key={benefit.title} className="text-[15px]">
            <p className="font-semibold text-[var(--journal-heading)]">{benefit.title}</p>
            <p className="mt-1 text-[var(--journal-body)]">{benefit.description}</p>
          </li>
        ))}
      </ul>

      <h3 className="mt-10 font-serif text-lg font-semibold text-[var(--journal-heading)]">
        What participants will gain
      </h3>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-[15px] text-[var(--journal-body)]">
        {colloquiaParticipantGains.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <h3 className="mt-10 font-serif text-lg font-semibold text-[var(--journal-heading)]">
        Colloquia tracks
      </h3>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-[15px] text-[var(--journal-body)]">
        {colloquiaTracks.map((track) => (
          <li key={track}>{track}</li>
        ))}
      </ul>

      <h3 className="mt-10 font-serif text-lg font-semibold text-[var(--journal-heading)]">
        Who can participate in Colloquia
      </h3>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-[15px] text-[var(--journal-body)]">
        {colloquiaWhoCanParticipate.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className="mt-4 text-[15px] text-[var(--journal-body)]">All are welcome to participate.</p>
      <p className="mt-2 text-[15px] text-[var(--journal-body)]">
        Registered conference participants can attend the Colloquia without an additional fee.
      </p>
    </section>
  );
}
