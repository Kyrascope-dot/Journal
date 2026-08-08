import { getSiteOrigin, seoDescription } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

/** Organization + Periodical schema for search engines and AI crawlers. */
export function SiteJsonLd() {
  const origin = getSiteOrigin();

  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${origin}/#website`,
        url: origin,
        name: siteConfig.name,
        alternateName: [siteConfig.shortName, "GCR Journal"],
        description: seoDescription,
        publisher: { "@id": `${origin}/#organization` },
        inLanguage: "en",
      },
      {
        "@type": "Organization",
        "@id": `${origin}/#organization`,
        name: siteConfig.publisherOrganisation,
        legalName: siteConfig.publisherOrganisation,
        url: origin,
        email: siteConfig.email,
        telephone: siteConfig.publisherMobileTel,
        address: {
          "@type": "PostalAddress",
          streetAddress: siteConfig.publisherAddress,
          addressLocality: "New Delhi",
          postalCode: "110097",
          addressCountry: "IN",
        },
        sameAs: [siteConfig.instagramUrl].filter(Boolean),
      },
      {
        "@type": "Periodical",
        "@id": `${origin}/#periodical`,
        name: siteConfig.name,
        alternateName: siteConfig.shortName,
        issn: siteConfig.issn,
        url: origin,
        description: seoDescription,
        publisher: { "@id": `${origin}/#organization` },
        inLanguage: "en",
        genre: [
          "multidisciplinary research journal",
          "open access journal",
          "young researchers journal",
          "high school research publication venue",
        ],
        audience: {
          "@type": "EducationalAudience",
          educationalRole: [
            "high school student",
            "undergraduate student",
            "early-career researcher",
            "academic researcher",
          ],
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
