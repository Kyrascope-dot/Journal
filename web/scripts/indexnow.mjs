/**
 * Tell Bing (used by ChatGPT search) and other IndexNow search engines about the
 * site's public pages. Run after a deployment goes live:
 *
 *   npm run indexnow
 *
 * It reads the live sitemap and submits every URL. The key file is served from
 * public/<key>.txt, which is how the search engines verify the site.
 */
const SITE = "https://www.globalconfluencereview.in";
const KEY = "efa8521b7e50b3e1e5f5e601ed814946";

const sitemap = await fetch(`${SITE}/sitemap.xml`).then((res) => {
  if (!res.ok) throw new Error(`Sitemap request failed: HTTP ${res.status}`);
  return res.text();
});
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
if (urlList.length === 0) throw new Error("No URLs found in the sitemap.");

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({
    host: new URL(SITE).host,
    key: KEY,
    keyLocation: `${SITE}/${KEY}.txt`,
    urlList,
  }),
});
// 200 = accepted, 202 = accepted and key check pending; anything else is an error.
console.log(`Submitted ${urlList.length} URLs to IndexNow: HTTP ${res.status} ${res.statusText}`);
if (res.status !== 200 && res.status !== 202) {
  console.log(await res.text());
  process.exitCode = 1;
}
