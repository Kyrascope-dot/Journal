import Image from "next/image";
import Link from "next/link";
import { editorialTeam, PLACEHOLDER } from "@/data/editorial";
import { SectionHeading } from "@/components/home/HomeSections";

const PREVIEW_COUNT = 4;

function profileLink(member: (typeof editorialTeam)[number]) {
  return member.orcidUrl ?? member.scholarUrl ?? member.linkedinUrl ?? member.facultyUrl;
}

export function HomeEditorialPreview() {
  const members = editorialTeam.slice(0, PREVIEW_COUNT);

  return (
    <section className="py-12" aria-labelledby="editorial-preview-heading">
      <SectionHeading
        id="editorial-preview-heading"
        title="Meet our editorial and advisory community"
      />
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {members.map((m) => {
          const href = profileLink(m);
          const institutionLine = m.designation?.split("\n")[0];
          return (
            <li
              key={m.id}
              className="flex flex-col rounded-lg border border-[var(--journal-border)] p-4"
            >
              <Image
                src={m.imageSrc ?? PLACEHOLDER}
                alt=""
                width={80}
                height={80}
                className="h-20 w-20 rounded-full object-cover"
              />
              <p className="mt-3 font-serif text-base font-semibold text-[var(--journal-heading)]">
                {m.name}
              </p>
              <p className="text-sm text-[var(--journal-accent)]">{m.headline}</p>
              {institutionLine ? (
                <p className="mt-1 text-xs text-[var(--journal-muted)]">{institutionLine}</p>
              ) : null}
              <p className="mt-2 text-xs text-[var(--journal-body)]">{m.qualification}</p>
              {href ? (
                <a
                  href={href}
                  className="mt-auto pt-3 text-sm text-[var(--journal-accent)] hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Profile
                </a>
              ) : null}
            </li>
          );
        })}
      </ul>
      <p className="mt-8">
        <Link href="/editorial" className="text-[var(--journal-accent)] hover:underline">
          View full editorial board
        </Link>
      </p>
    </section>
  );
}
