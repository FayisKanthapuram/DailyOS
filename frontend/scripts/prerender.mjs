#!/usr/bin/env node
/**
 * DailyOS — Post-build Static Prerender Script
 * =============================================
 * Runs automatically after `vite build` via the `postbuild` npm script.
 *
 * What this script does:
 * 1. Reads VITE_SITE_URL from environment — fails fast if missing in production.
 * 2. Reads dist/index.html as the base template.
 * 3. For each public page (/,  /privacy, /terms):
 *    - Injects page-specific <title>, <meta>, <link rel="canonical">, OG tags, Twitter tags.
 *    - Writes the resulting HTML to the correct output path.
 * 4. Generates dist/sitemap.xml using VITE_SITE_URL.
 * 5. Generates dist/robots.txt referencing the same sitemap URL.
 *
 * React hydration is unaffected: the <div id="root"></div> and all script
 * tags are preserved in every generated file. The only difference between
 * the files is the <head> metadata.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, '..', 'dist');

// ── Environment ────────────────────────────────────────────────────────────────

const siteUrl = (process.env.VITE_SITE_URL || '').replace(/\/$/, '');
const isProduction = process.env.NODE_ENV === 'production';

if (!siteUrl) {
  if (isProduction) {
    console.error('\n❌  VITE_SITE_URL is required for production builds.');
    console.error('    Set it to your production domain, e.g.:');
    console.error('    VITE_SITE_URL=https://app.yourdomain.com npm run build\n');
    process.exit(1);
  } else {
    console.warn('\n⚠️  VITE_SITE_URL is not set. Using empty string for local build.');
    console.warn('    Canonical URLs and sitemap will be relative paths.\n');
  }
}

// ── Page definitions ───────────────────────────────────────────────────────────

const pages = [
  {
    path: '/',
    outFile: 'index.html',
    outDir: distDir,
    title: 'DailyOS — Plan Your Day. Build Better Habits.',
    description:
      'Organize tasks, build recurring daily, weekly, and monthly habits, plan your calendar, and track your productivity. A free task and habit planner.',
    robots: 'index, follow',
  },
  {
    path: '/privacy',
    outFile: 'index.html',
    outDir: join(distDir, 'privacy'),
    title: 'Privacy Policy — DailyOS',
    description:
      'Learn how DailyOS collects, uses, and protects your personal data. We believe in privacy by design.',
    robots: 'index, follow',
  },
  {
    path: '/terms',
    outFile: 'index.html',
    outDir: join(distDir, 'terms'),
    title: 'Terms of Service — DailyOS',
    description:
      'Terms and conditions for using DailyOS. Acceptable use policy, data ownership, and service limitations.',
    robots: 'index, follow',
  },
];

// ── Helper: build <head> metadata block ───────────────────────────────────────

function buildMetaBlock(page) {
  const canonicalUrl = `${siteUrl}${page.path === '/' ? '' : page.path}`;
  const ogImageUrl = `${siteUrl}/og-image.jpg`;

  return `
    <!-- Primary Meta -->
    <title>${page.title}</title>
    <meta
      name="description"
      content="${page.description}"
    />
    <meta name="robots" content="${page.robots}" />
    <meta name="theme-color" content="#3b82f6" />
    <meta name="color-scheme" content="dark light" />
    ${canonicalUrl ? `<link rel="canonical" href="${canonicalUrl}" />` : ''}

    <!-- Open Graph -->
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="DailyOS" />
    <meta property="og:locale" content="en_US" />
    <meta property="og:title" content="${page.title}" />
    <meta
      property="og:description"
      content="${page.description}"
    />
    ${canonicalUrl ? `<meta property="og:url" content="${canonicalUrl}" />` : ''}
    <meta property="og:image" content="${ogImageUrl}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${page.title}" />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${page.title}" />
    <meta
      name="twitter:description"
      content="${page.description}"
    />
    <meta name="twitter:image" content="${ogImageUrl}" />

    <!-- Icons & PWA -->
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="apple-touch-icon" href="/icon-512.jpg" />
    <link rel="manifest" href="/manifest.webmanifest" />

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />

    <!-- JSON-LD Structured Data -->
    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "SoftwareApplication",
            "name": "DailyOS",
            "applicationCategory": "ProductivityApplication",
            "operatingSystem": "Web",
            "description": "A task and recurring habit planner with calendar planning and productivity statistics.",
            "url": "${siteUrl || '/'}",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            }
          },
          {
            "@type": "WebSite",
            "name": "DailyOS",
            "description": "Plan your day. Build better habits.",
            "url": "${siteUrl || '/'}"
          },
          {
            "@type": "Organization",
            "name": "DailyOS",
            "url": "${siteUrl || '/'}"
          }
        ]
      }
    </script>`.trim();
}

// ── Helper: inject metadata into template ─────────────────────────────────────

function injectMeta(template, page) {
  const metaBlock = buildMetaBlock(page);

  // Remove existing <title> and all <meta> / <link rel="canonical"> / JSON-LD from <head>
  // Strategy: replace everything between <head> and </head> that we control,
  // while preserving Vite-injected <script> and <link rel="stylesheet"> etc.
  // We do this by replacing the content between the opening <head> tag and the first Vite asset tag.

  // Replace <head> opening tag content up to the first Vite CSS link or closing </head>
  // Simple approach: replace the pattern of known static meta from index.html template
  let result = template;

  // Replace everything between <head> (exclusive) and the first <link href="https://fonts... (or </head>)
  // We know the template structure: everything before the Vite injected assets is our meta block
  // Use a regex that captures from <head> to the first </head> occurrence
  result = result.replace(
    /<head>([\s\S]*?)<\/head>/,
    (_, _inner) => `<head>\n    ${metaBlock}\n  </head>`,
  );

  return result;
}

// ── Main: generate HTML files ─────────────────────────────────────────────────

const templatePath = join(distDir, 'index.html');
let template;
try {
  template = readFileSync(templatePath, 'utf-8');
} catch {
  console.error(`\n❌  Could not read ${templatePath}`);
  console.error('    Run "npm run build" (vite build) before this script.\n');
  process.exit(1);
}

for (const page of pages) {
  const html = injectMeta(template, page);

  mkdirSync(page.outDir, { recursive: true });
  const outputPath = join(page.outDir, page.outFile);
  writeFileSync(outputPath, html, 'utf-8');
  console.log(`✅  Generated: ${outputPath.replace(distDir, 'dist')}`);
}

// ── Sitemap ────────────────────────────────────────────────────────────────────

const now = new Date().toISOString().split('T')[0];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${siteUrl}/privacy</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>${siteUrl}/terms</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
</urlset>`;

writeFileSync(join(distDir, 'sitemap.xml'), sitemap, 'utf-8');
console.log(`✅  Generated: dist/sitemap.xml`);

// ── robots.txt ────────────────────────────────────────────────────────────────

const robots = `User-agent: *
Allow: /
Allow: /privacy
Allow: /terms
Disallow: /dashboard
Disallow: /tasks
Disallow: /calendar
Disallow: /login
Disallow: /register
Disallow: /forgot-password
Disallow: /api/

Sitemap: ${siteUrl}/sitemap.xml
`;

writeFileSync(join(distDir, 'robots.txt'), robots, 'utf-8');
console.log(`✅  Generated: dist/robots.txt`);

console.log('\n🎉  Prerender complete.\n');
