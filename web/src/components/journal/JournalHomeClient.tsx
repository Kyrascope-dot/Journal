// import Link from "next/link";
// import { fetchCurrentIssueServer } from "@/lib/server/journal-data";
// import { demoCurrentIssue } from "@/lib/demo-data";
// import { contentProse, contentShell } from "@/lib/content-layout";
// import { formatPublished } from "@/lib/format-dates";
// import { mergeIssueWithLocalPapers } from "@/lib/local-issue-assets";
// import { siteConfig } from "@/lib/site-config";
// import { ArticleList } from "@/components/journal/ArticleList";

// /**
//  * Server-rendered so the current issue's real title, authors, and article list
//  * are present in the raw HTML response — visible to search engines and AI
//  * crawlers (GPTBot, ChatGPT link previews, etc.) that don't execute JavaScript.
//  */
// export async function JournalHomeClient() {
//   const fetched = await fetchCurrentIssueServer();
//   const data = mergeIssueWithLocalPapers(fetched ?? demoCurrentIssue);

//   return (
//     <div className={`${contentShell} py-10`} id="current-issue">
//       <header className="border-b border-[var(--journal-border)] pb-8">
//         <p className="text-sm font-medium uppercase tracking-wider text-[var(--journal-muted)]">
//           Current Issue
//         </p>
//         <h2 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-[var(--journal-heading)] sm:text-4xl">
//           {data.title}
//         </h2>
//         <p className="mt-2 text-sm text-[var(--journal-muted)]">
//           {siteConfig.shortName} · Volume {data.volume}, Issue{" "}
//           {data.issueNumber}
//           {data.publishedAt ? (
//             <> · Published: {formatPublished(data.publishedAt)}</>
//           ) : (
//             <> · Forthcoming {data.year}</>
//           )}
//         </p>
//         <div className="mt-6 flex flex-wrap gap-3">
//           <Link
//             href={`/issues/${data.slug}`}
//             className="inline-flex items-center rounded border border-[var(--journal-accent)] bg-[var(--journal-accent)] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-95"
//           >
//             View full issue
//           </Link>
//           {data.pdfUrl && (
//             <a
//               href={data.pdfUrl}
//               target="_blank"
//               rel="noopener noreferrer"
//               className="inline-flex items-center gap-2 rounded border border-[var(--journal-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--journal-heading)] transition hover:bg-zinc-50"
//             >
//               <svg
//                 className="h-4 w-4 shrink-0 text-red-500"
//                 viewBox="0 0 20 20"
//                 fill="currentColor"
//                 aria-hidden
//               >
//                 <path
//                   fillRule="evenodd"
//                   d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
//                   clipRule="evenodd"
//                 />
//               </svg>
//               Download PDF
//             </a>
//           )}
//           <Link
//             href="/issues"
//             className="inline-flex items-center rounded border border-[var(--journal-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--journal-heading)] transition hover:bg-zinc-50"
//           >
//             All issues
//           </Link>
//         </div>
//       </header>

//       {data.articles.length > 0 ? (
//         <section className="mt-10" aria-labelledby="latest-articles-heading">
//           <h2
//             id="latest-articles-heading"
//             className="font-serif text-xl font-semibold text-[var(--journal-heading)]"
//           >
//             Latest articles
//           </h2>
//           <div className="mt-6">
//             <ArticleList articles={data.articles} issueSlug={data.slug} />
//           </div>
//         </section>
//       ) : null}

//       <section
//         className={`mt-14 border-t border-[var(--journal-border)] pt-10 ${contentProse}`}
//       >
//         <h2 className="font-serif text-xl font-semibold text-[var(--journal-heading)]">
//           About this journal
//         </h2>
//         <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-[var(--journal-body)]">
//           <p>
//             <strong>{siteConfig.name}</strong>
//             {siteConfig.issn ? <> (ISSN {siteConfig.issn})</> : null} is an
//             international, peer-reviewed, open-access academic journal committed
//             to fostering intellectual exchange across diverse disciplines. The
//             journal is for <strong>high school students</strong>,{" "}
//             <strong>researchers</strong>, educators, and practitioners who want
//             to publish or read rigorous work in an open-access setting.
//           </p>
//           <p>
//             We accept <strong>research papers</strong>, <strong>essays</strong>,
//             and <strong>review papers</strong>, along with other scholarly
//             contributions that meet our scope and ethics guidelines. The journal
//             serves as a platform to present high-quality work that bridges
//             traditional academic boundaries and encourages interdisciplinary
//             dialogue.
//           </p>
//           <p>
//             With a strong emphasis on academic rigour and integrity, the journal
//             follows a double-blind peer-review process, ensuring unbiased
//             evaluation and the publication of original, impactful research. It
//             also welcomes empirical studies, theoretical papers, review
//             articles, and critical discussions where appropriate.
//           </p>
//           <p>
//             By integrating perspectives from both qualitative and quantitative
//             domains, <strong>{siteConfig.name}</strong> aims to create a true
//             confluence of ideas that address complex global challenges and
//             contribute meaningfully to academic, technological, and policy
//             advancements. The journal is dedicated to promoting accessibility
//             and knowledge dissemination through its open-access model, ensuring
//             that research is available to a global audience without barriers.
//           </p>
//         </div>

//         <h3 className="mt-8 font-serif text-lg font-semibold text-[var(--journal-heading)]">
//           Multidisciplinary scope
//         </h3>
//         <ul className="mt-4 grid gap-2 sm:grid-cols-2">
//           {[
//             "Anthropology & Sociology",
//             "Psychology & Education",
//             "Economics & Management",
//             "Law, History & Cultural Studies",
//             "Communication & Peace Studies",
//             "Science, Technology, Engineering & Mathematics (STEM)",
//           ].map((item) => (
//             <li
//               key={item}
//               className="flex items-center gap-2 text-sm text-[var(--journal-body)]"
//             >
//               <span
//                 className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--journal-accent)]"
//                 aria-hidden
//               />
//               {item}
//             </li>
//           ))}
//         </ul>
//       </section>
//     </div>
//   );
// }

// changed-file
import Link from "next/link";
import { fetchCurrentIssueServer } from "@/lib/server/journal-data";
import { contentProse, contentShell } from "@/lib/content-layout";
import { formatPublished } from "@/lib/format-dates";
import { getHomeIssues } from "@/lib/local-issue-assets";
import { siteConfig } from "@/lib/site-config";
import { ArticleList } from "@/components/journal/ArticleList";

/**
 * Server-rendered so the current issue's real title, authors, and article list
 * are present in the raw HTML response — visible to search engines and AI
 * crawlers (GPTBot, ChatGPT link previews, etc.) that don't execute JavaScript.
 */
export async function JournalHomeClient() {
  const fetched = await fetchCurrentIssueServer();
  const homeIssues = getHomeIssues(fetched);

  return (
    <div className={`${contentShell} py-10`} id="current-issue">
      {homeIssues.map((data, index) => (
        <div key={data.slug} className={index > 0 ? "mt-16" : undefined}>
          <header className="border-b border-[var(--journal-border)] pb-8">
            <p className="text-sm font-medium uppercase tracking-wider text-[var(--journal-muted)]">
              {index === 0 ? "Current Issue" : "Previous Issue"}
            </p>
            <h2 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-[var(--journal-heading)] sm:text-4xl">
              {data.title}
            </h2>
            <p className="mt-2 text-sm text-[var(--journal-muted)]">
              {siteConfig.shortName} · Volume {data.volume}, Issue{" "}
              {data.issueNumber}
              {data.publishedAt ? (
                <> · Published: {formatPublished(data.publishedAt)}</>
              ) : (
                <> · Forthcoming {data.year}</>
              )}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/issues/${data.slug}`}
                className="inline-flex items-center rounded border border-[var(--journal-accent)] bg-[var(--journal-accent)] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-95"
              >
                View full issue
              </Link>
              {data.pdfUrl && (
                <a
                  href={data.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded border border-[var(--journal-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--journal-heading)] transition hover:bg-zinc-50"
                >
                  <svg
                    className="h-4 w-4 shrink-0 text-red-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Download PDF
                </a>
              )}
              <Link
                href="/issues"
                className="inline-flex items-center rounded border border-[var(--journal-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--journal-heading)] transition hover:bg-zinc-50"
              >
                All issues
              </Link>
            </div>
          </header>

          {data.articles.length > 0 ? (
            <section
              className="mt-10"
              aria-labelledby={`${data.slug}-articles-heading`}
            >
              <h2
                id={`${data.slug}-articles-heading`}
                className="font-serif text-xl font-semibold text-[var(--journal-heading)]"
              >
                Latest articles
              </h2>
              <div className="mt-6">
                <ArticleList articles={data.articles} issueSlug={data.slug} />
              </div>
            </section>
          ) : null}
        </div>
      ))}

      <section
        className={`mt-14 border-t border-[var(--journal-border)] pt-10 ${contentProse}`}
      >
        <h2 className="font-serif text-xl font-semibold text-[var(--journal-heading)]">
          About this journal
        </h2>
        <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-[var(--journal-body)]">
          <p>
            <strong>{siteConfig.name}</strong>
            {siteConfig.issn ? <> (ISSN {siteConfig.issn})</> : null} is an
            international, peer-reviewed, open-access academic journal committed
            to fostering intellectual exchange across diverse disciplines. The
            journal is for <strong>high school students</strong>,{" "}
            <strong>researchers</strong>, educators, and practitioners who want
            to publish or read rigorous work in an open-access setting.
          </p>
          <p>
            We accept <strong>research papers</strong>, <strong>essays</strong>,
            and <strong>review papers</strong>, along with other scholarly
            contributions that meet our scope and ethics guidelines. The journal
            serves as a platform to present high-quality work that bridges
            traditional academic boundaries and encourages interdisciplinary
            dialogue.
          </p>
          <p>
            With a strong emphasis on academic rigour and integrity, the journal
            follows a double-blind peer-review process, ensuring unbiased
            evaluation and the publication of original, impactful research. It
            also welcomes empirical studies, theoretical papers, review
            articles, and critical discussions where appropriate.
          </p>
          <p>
            By integrating perspectives from both qualitative and quantitative
            domains, <strong>{siteConfig.name}</strong> aims to create a true
            confluence of ideas that address complex global challenges and
            contribute meaningfully to academic, technological, and policy
            advancements. The journal is dedicated to promoting accessibility
            and knowledge dissemination through its open-access model, ensuring
            that research is available to a global audience without barriers.
          </p>
        </div>

        <h3 className="mt-8 font-serif text-lg font-semibold text-[var(--journal-heading)]">
          Multidisciplinary scope
        </h3>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {[
            "Anthropology & Sociology",
            "Psychology & Education",
            "Economics & Management",
            "Law, History & Cultural Studies",
            "Communication & Peace Studies",
            "Science, Technology, Engineering & Mathematics (STEM)",
          ].map((item) => (
            <li
              key={item}
              className="flex items-center gap-2 text-sm text-[var(--journal-body)]"
            >
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--journal-accent)]"
                aria-hidden
              />
              {item}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
