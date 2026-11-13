import fs from "node:fs";
import path from "node:path";

// Generate robots.txt and sitemap.xml at build time. Vercel exposes the
// deployment host automatically; VITE_SITE_URL can override it with a custom
// domain. No configuration is required for a default Vercel deployment.
const rawBase =
	process.env.VITE_SITE_URL ||
	(process.env.VERCEL_PROJECT_PRODUCTION_URL
		? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
		: process.env.VERCEL_URL
			? `https://${process.env.VERCEL_URL}`
			: "http://localhost:5178");
const base = rawBase.replace(/\/$/, "");

const routes = [
	"",
	"/collection",
	"/about",
	"/contact",
	"/delivery",
	"/returns",
	"/privacy",
	"/terms",
	"/wishlist",
];

const today = new Date().toISOString().slice(0, 10);

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
	.map(
		(route) => `  <url>
    <loc>${base}${route}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route === "" || route === "/collection" ? "daily" : "monthly"}</changefreq>
    <priority>${route === "" ? "1.0" : route === "/collection" ? "0.9" : "0.5"}</priority>
  </url>`
	)
	.join("\n")}
</urlset>
`;

const robots = `User-agent: *
Allow: /

Sitemap: ${base}/sitemap.xml
`;

const dist = path.resolve(process.cwd(), "dist");
const pub = path.resolve(process.cwd(), "public");

if (fs.existsSync(dist)) {
	fs.writeFileSync(path.join(dist, "sitemap.xml"), sitemap);
	fs.writeFileSync(path.join(dist, "robots.txt"), robots);
}

if (fs.existsSync(pub)) {
	fs.writeFileSync(path.join(pub, "sitemap.xml"), sitemap);
	fs.writeFileSync(path.join(pub, "robots.txt"), robots);
}

if (!fs.existsSync(dist) && !fs.existsSync(pub)) {
	console.warn("dist/ and public/ not found — skipping SEO files.");
	process.exit(0);
}

console.log(`Generated sitemap.xml and robots.txt for ${base}`);
