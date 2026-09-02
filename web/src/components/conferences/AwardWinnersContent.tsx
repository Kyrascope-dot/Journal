import Link from "next/link";
import {
  AWARD_WINNERS_EMAIL_NOTE,
  AWARD_WINNERS_INTRO,
  AWARD_WINNERS_SCORE_NOTE,
  CONFERENCE_AWARD_WINNERS,
  type AwardEntry,
  type TrackAwards,
} from "@/data/conference-award-winners";
import { contentProse, contentShell } from "@/lib/content-layout";

function formatScore(score: number): string {
  return `${score}/100`;
}

function tieLabel(entries: AwardEntry[]): string | null {
  const tied = entries.filter((e) => e.tied);
  if (tied.length < 2) return null;
  const score = tied[0]?.score;
  if (score == null) return null;
  return `TIED AT ${formatScore(score)}`;
}

function AwardNameScore({ entry }: { entry: AwardEntry }) {
  return (
    <p className="mt-1 text-[15px] font-medium text-[var(--journal-heading)]">
      {entry.name}
      <span className="ml-2 font-normal text-[var(--journal-muted)]">{formatScore(entry.score)}</span>
    </p>
  );
}

function GeneralBestPresenterSection({ track }: { track: TrackAwards }) {
  const coBest = track.bestPresenter.length > 1;
  const tie = tieLabel(track.bestPresenter);

  return (
    <section className="mt-6" aria-labelledby={`${track.track}-general-best`}>
      <h3
        id={`${track.track}-general-best`}
        className="font-serif text-lg font-semibold text-[var(--journal-heading)]"
      >
        {coBest ? "Co-Best Presenter Awardees" : "Best Presenter Award"}
      </h3>
      <div className="mt-3 rounded-lg border border-[var(--journal-accent)]/25 bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--journal-accent)]">
          {coBest ? "Co-Best Presenter" : "Best Presenter"}
        </p>
        {track.bestPresenter.map((entry) => (
          <AwardNameScore key={entry.name} entry={entry} />
        ))}
        {tie ? (
          <p className="mt-2 text-xs font-medium text-amber-800">{tie}</p>
        ) : null}
      </div>
    </section>
  );
}

function PhdScholarBestPresenterSection({ track }: { track: TrackAwards }) {
  if (track.phdScholarBestPresenter.length === 0) return null;

  return (
    <section className="mt-6" aria-labelledby={`${track.track}-phd-best`}>
      <h3
        id={`${track.track}-phd-best`}
        className="font-serif text-lg font-semibold text-[var(--journal-heading)]"
      >
        Best Presenter Award — PhD Scholar
      </h3>
      <div className="mt-3 rounded-lg border border-amber-200/80 bg-amber-50/40 p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-900/80">
          PhD Scholar Best Presenter
        </p>
        {track.phdScholarBestPresenter.map((entry) => (
          <AwardNameScore key={entry.name} entry={entry} />
        ))}
      </div>
    </section>
  );
}

function RunnerUpList({
  id,
  title,
  entries,
  variant = "general",
}: {
  id: string;
  title: string;
  entries: AwardEntry[];
  variant?: "general" | "phd";
}) {
  if (entries.length === 0) return null;

  const tie = tieLabel(entries);
  const borderClass =
    variant === "phd"
      ? "border-amber-200/60 bg-amber-50/20"
      : "border-[var(--journal-border)] bg-zinc-50/50";

  return (
    <section className="mt-6" aria-labelledby={id}>
      <h3 id={id} className="font-serif text-lg font-semibold text-[var(--journal-heading)]">
        {title}
      </h3>
      <ul className={`mt-3 space-y-2 rounded-lg border p-4 ${borderClass}`}>
        {entries.map((entry, index) => (
          <li key={`${entry.name}-${index}`} className="text-[15px] text-[var(--journal-body)]">
            <span className="font-medium text-[var(--journal-heading)]">
              {variant === "phd" ? `PhD Scholar Runner-Up ${index + 1}` : `Runner-Up ${index + 1}`}
            </span>
            {" — "}
            {entry.name}
            <span className="text-[var(--journal-muted)]"> · {formatScore(entry.score)}</span>
          </li>
        ))}
      </ul>
      {tie ? <p className="mt-2 text-xs font-medium text-amber-800">{tie}</p> : null}
    </section>
  );
}

function TrackCard({ track }: { track: TrackAwards }) {
  return (
    <article
      className="rounded-xl border border-[var(--journal-border)] bg-white p-6 shadow-sm sm:p-8"
      aria-labelledby={`${track.track}-heading`}
    >
      <h2
        id={`${track.track}-heading`}
        className="font-serif text-2xl font-semibold text-[var(--journal-accent)]"
      >
        {track.track}
      </h2>

      <GeneralBestPresenterSection track={track} />
      <PhdScholarBestPresenterSection track={track} />

      <RunnerUpList
        id={`${track.track}-general-runners`}
        title="General Runner-Up Awards"
        entries={track.runnerUps}
        variant="general"
      />

      <RunnerUpList
        id={`${track.track}-phd-runners`}
        title="PhD Scholar Runner-Up Awards"
        entries={track.phdScholarRunnerUps}
        variant="phd"
      />
    </article>
  );
}

export function AwardWinnersContent() {
  return (
    <div className={`${contentShell} py-12`}>
      <header className={`${contentProse} max-w-4xl`}>
        <p className="text-sm font-medium uppercase tracking-wide text-[var(--journal-muted)]">
          GCR International Multidisciplinary Conference
        </p>
        <h1 className="mt-2 font-serif text-3xl font-semibold text-[var(--journal-heading)] sm:text-4xl">
          GCR International Conference 2026
        </h1>
        <p className="mt-3 font-serif text-xl text-[var(--journal-accent)]">
          Best Presenter Award Results
        </p>
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--journal-body)]">
          Recognising outstanding research presentations and academic communication across the
          conference tracks.
        </p>
      </header>

      <div className={`${contentProse} mt-8 max-w-4xl`}>
        <p className="text-[15px] leading-relaxed text-[var(--journal-body)]">{AWARD_WINNERS_INTRO}</p>
      </div>

      <div className="mt-10 space-y-10">
        {CONFERENCE_AWARD_WINNERS.map((track) => (
          <TrackCard key={track.track} track={track} />
        ))}
      </div>

      <section
        className="mt-12 max-w-4xl rounded-lg border border-[var(--journal-border)] bg-zinc-50 p-6"
        aria-labelledby="score-note-heading"
      >
        <h2 id="score-note-heading" className="font-serif text-lg font-semibold text-[var(--journal-heading)]">
          Score Note
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-[var(--journal-body)]">
          {AWARD_WINNERS_SCORE_NOTE}
        </p>
      </section>

      <section
        className="mt-8 max-w-4xl rounded-lg border border-[var(--journal-accent)]/30 bg-[var(--journal-hero-bg)] p-6"
        aria-labelledby="email-note-heading"
      >
        <h2 id="email-note-heading" className="font-serif text-lg font-semibold text-[var(--journal-heading)]">
          Important Note
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-[var(--journal-body)]">
          {AWARD_WINNERS_EMAIL_NOTE}
        </p>
      </section>

      <p className="mt-10 text-sm">
        <Link href="/conferences" className="text-[var(--journal-accent)] hover:underline">
          Back to conferences
        </Link>
      </p>
    </div>
  );
}
