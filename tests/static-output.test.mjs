import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const staticHtmlPath = path.resolve(process.cwd(), "dist/client/index.html");
const sitemapPath = path.resolve(process.cwd(), "dist/client/sitemap.xml");
const artifactStatusPath = path.resolve(process.cwd(), "dist/client/artifact-status.json");
const themeCssPath = path.resolve(process.cwd(), "client/src/theme.css");

test("static output contains real resume content instead of loading placeholders", () => {
  assert.ok(fs.existsSync(staticHtmlPath), `Expected built HTML at ${staticHtmlPath}`);

  const html = fs.readFileSync(staticHtmlPath, "utf8");

  assert.ok(
    html.includes("Senior Developer | AI Enthusiast"),
    "expected the static output to include the translated header subtitle"
  );
  assert.ok(
    html.includes("akaraduman@gmail.com"),
    "expected the static output to include contact content"
  );
  assert.ok(
    !html.includes("animate-pulse"),
    "expected the static output to render real content instead of loading skeletons"
  );
});

test("static build emits a sitemap with the homepage and generated resume artifacts", () => {
  assert.ok(fs.existsSync(sitemapPath), `Expected sitemap at ${sitemapPath}`);

  const sitemap = fs.readFileSync(sitemapPath, "utf8");

  assert.ok(
    sitemap.includes("<loc>https://resume.arda.tr/</loc>"),
    "expected the sitemap to include the homepage URL"
  );
  assert.ok(
    sitemap.includes("<loc>https://resume.arda.tr/resume-en.pdf</loc>"),
    "expected the sitemap to include the English PDF URL"
  );
  assert.ok(
    sitemap.includes("<loc>https://resume.arda.tr/resume-ja.pdf</loc>"),
    "expected the sitemap to include the Japanese PDF URL"
  );
  assert.ok(
    sitemap.includes("<loc>https://resume.arda.tr/resume-tr.pdf</loc>"),
    "expected the sitemap to include the Turkish PDF URL"
  );
  assert.ok(
    sitemap.includes("<loc>https://resume.arda.tr/resume-en.docx</loc>"),
    "expected the sitemap to include the English DOCX URL"
  );
  assert.ok(
    sitemap.includes("<loc>https://resume.arda.tr/resume-ja.docx</loc>"),
    "expected the sitemap to include the Japanese DOCX URL"
  );
  assert.ok(
    sitemap.includes("<loc>https://resume.arda.tr/resume-tr.docx</loc>"),
    "expected the sitemap to include the Turkish DOCX URL"
  );
});

test("static build writes artifact status for PDF and DOCX outputs", () => {
  assert.ok(fs.existsSync(artifactStatusPath), `Expected artifact status at ${artifactStatusPath}`);

  const artifactStatus = JSON.parse(fs.readFileSync(artifactStatusPath, "utf8"));

  assert.deepEqual(artifactStatus, {
    pdf: { en: true, ja: true, tr: true },
    docx: { en: true, ja: true, tr: true },
  });
});

test("generated theme CSS contains all selectable themes", () => {
  assert.ok(fs.existsSync(themeCssPath), `Expected generated theme CSS at ${themeCssPath}`);

  const themeCss = fs.readFileSync(themeCssPath, "utf8");

  assert.ok(
    themeCss.includes(".van-helsing"),
    "expected the generated theme CSS to include the van-helsing selector"
  );
  assert.ok(
    themeCss.includes(".dracula"),
    "expected the generated theme CSS to include the dracula selector"
  );
  assert.ok(
    themeCss.includes(".alucard"),
    "expected the generated theme CSS to include the alucard selector"
  );
});
