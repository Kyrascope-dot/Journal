import Image from "next/image";
import { TECH_RESEARCH_DATAWAVES_COLLABORATION } from "@/lib/tech-research-hub-content";

type Variant = "featured" | "compact";

function DataWavesLogoLink({
  width,
  height,
  imageClassName,
  wrapperClassName,
}: {
  width: number;
  height: number;
  imageClassName: string;
  wrapperClassName?: string;
}) {
  const { logoSrc, logoAlt, partnerName, websiteUrl } = TECH_RESEARCH_DATAWAVES_COLLABORATION;

  return (
    <a
      href={websiteUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex shrink-0 rounded-md transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--journal-accent)] ${wrapperClassName ?? ""}`}
      aria-label={`Visit ${partnerName} website (opens in a new tab)`}
    >
      <Image
        src={logoSrc}
        alt={logoAlt}
        width={width}
        height={height}
        unoptimized
        className={imageClassName}
      />
    </a>
  );
}

export function DataWavesCollaborationBanner({ variant = "featured" }: { variant?: Variant }) {
  const { headline, description, partnerName, websiteUrl, websiteLabel } =
    TECH_RESEARCH_DATAWAVES_COLLABORATION;

  if (variant === "compact") {
    return (
      <div className="mt-6 flex flex-col gap-4 rounded-lg border border-[var(--journal-border)] bg-white p-4 sm:flex-row sm:items-center">
        <DataWavesLogoLink
          width={426}
          height={114}
          imageClassName="h-12 w-auto max-w-[220px] rounded-md object-contain sm:h-14 sm:max-w-[260px]"
        />
        <p className="text-sm leading-relaxed text-[var(--journal-body)]">
          <span className="font-medium text-[var(--journal-heading)]">{headline}.</span>{" "}
          {description}{" "}
          <a
            href={websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[var(--journal-accent)] hover:underline"
          >
            {websiteLabel}
          </a>
        </p>
      </div>
    );
  }

  return (
    <section
      className="mt-8 rounded-xl border border-[var(--journal-border)] bg-white p-6 sm:p-8"
      aria-labelledby="datawaves-collaboration-heading"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-wide text-[var(--journal-accent)]">
            In collaboration with
          </p>
          <h2
            id="datawaves-collaboration-heading"
            className="mt-2 font-serif text-2xl font-semibold text-[var(--journal-heading)] sm:text-3xl"
          >
            {headline}
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-[var(--journal-body)]">
            {description}
          </p>
          <p className="mt-3 text-sm text-[var(--journal-body)]">
            Learn more about our partner{" "}
            <a
              href={websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[var(--journal-accent)] hover:underline"
            >
              {partnerName} ({websiteLabel})
            </a>
            .
          </p>
        </div>
        <DataWavesLogoLink
          width={426}
          height={114}
          imageClassName="h-14 w-auto max-w-[280px] rounded-lg object-contain sm:h-16 sm:max-w-[320px]"
        />
      </div>
    </section>
  );
}
