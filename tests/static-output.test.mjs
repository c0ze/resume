import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const staticHtmlPath = path.resolve(process.cwd(), "dist/client/index.html");
const sitemapPath = path.resolve(process.cwd(), "dist/client/sitemap.xml");
const artifactStatusPath = path.resolve(process.cwd(), "dist/client/artifact-status.json");
const themeCssPath = path.resolve(process.cwd(), "client/src/theme.css");
const clientDistDir = path.resolve(process.cwd(), "dist/client");
const languages = ["en", "ja", "tr"];

test("static output contains real resume content instead of loading placeholders", () => {
  assert.ok(fs.existsSync(staticHtmlPath), `Expected built HTML at ${staticHtmlPath}`);

  const html = fs.readFileSync(staticHtmlPath, "utf8");

  assert.ok(
    html.includes("Backend Systems Architect"),
    "expected the static output to include the translated header subtitle"
  );
  assert.ok(
    html.includes("Get In Touch"),
    "expected the static output to include contact content"
  );
  assert.ok(
    !html.includes("akaraduman@gmail.com"),
    "expected the email to be hidden from the web page (kept only in the downloadable PDF/DOCX)"
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
  for (const lang of languages) {
    assert.ok(
      sitemap.includes(`<loc>https://resume.arda.tr/resume-${lang}.json</loc>`),
      `expected the sitemap to include the ${lang} JSON Resume URL`
    );
  }
  assert.ok(
    sitemap.includes("<loc>https://resume.arda.tr/arda.vcf</loc>"),
    "expected the sitemap to include the vCard URL"
  );
});

test("static build writes artifact status for PDF, DOCX, JSON, and vCard outputs", () => {
  assert.ok(fs.existsSync(artifactStatusPath), `Expected artifact status at ${artifactStatusPath}`);

  const artifactStatus = JSON.parse(fs.readFileSync(artifactStatusPath, "utf8"));

  assert.deepEqual(artifactStatus, {
    pdf: { en: true, ja: true, tr: true },
    docx: { en: true, ja: true, tr: true },
    json: { en: true, ja: true, tr: true },
    vcf: { arda: true },
  });
});

test("static build emits JSON Resume exports with basics but without the web-only abstracts", () => {
  // A distinctive phrase that only appears in an `abstract` in content/en —
  // the JSON export must ignore abstracts just like the PDF/DOCX generators do.
  const abstractOnlyPhrase = "Lead engineer on Veltra's AI platform";
  const enExperience = JSON.parse(
    fs.readFileSync(path.resolve(process.cwd(), "content/en/experience.json"), "utf8")
  );
  assert.ok(
    enExperience.jobs.some((job) => (job.abstract ?? "").includes(abstractOnlyPhrase)),
    "expected the sentinel phrase to exist in a content/en abstract (update the test if content changed)"
  );

  for (const lang of languages) {
    const jsonPath = path.join(clientDistDir, `resume-${lang}.json`);
    assert.ok(fs.existsSync(jsonPath), `Expected JSON Resume at ${jsonPath}`);

    const raw = fs.readFileSync(jsonPath, "utf8");
    const resume = JSON.parse(raw);

    assert.ok(resume.basics.name, `expected resume-${lang}.json to include basics.name`);
    assert.ok(resume.basics.email, `expected resume-${lang}.json to include basics.email`);

    if (lang === "en") {
      assert.ok(
        !raw.includes(abstractOnlyPhrase),
        "expected the JSON Resume export to exclude the web-only abstract text"
      );
    }

    const experience = JSON.parse(
      fs.readFileSync(path.resolve(process.cwd(), `content/${lang}/experience.json`), "utf8")
    );
    for (const job of experience.jobs) {
      if (!job.abstract) continue;
      assert.ok(
        !raw.includes(job.abstract),
        `expected resume-${lang}.json to exclude the abstract of "${job.company}"`
      );
    }
  }
});

test("static build emits a vCard with the contact details", () => {
  const vcardPath = path.join(clientDistDir, "arda.vcf");
  assert.ok(fs.existsSync(vcardPath), `Expected vCard at ${vcardPath}`);

  const vcard = fs.readFileSync(vcardPath, "utf8");

  assert.ok(vcard.startsWith("BEGIN:VCARD"), "expected the vCard to start with BEGIN:VCARD");
  assert.ok(vcard.includes("EMAIL"), "expected the vCard to include an EMAIL property");
  assert.ok(vcard.includes("\r\n"), "expected the vCard to use CRLF line endings per spec");
});

test("generated theme CSS contains all four renditions", () => {
  assert.ok(fs.existsSync(themeCssPath), `Expected generated theme CSS at ${themeCssPath}`);

  const themeCss = fs.readFileSync(themeCssPath, "utf8");

  // The four renditions of the record book (see DESIGN.md).
  for (const selector of [".ruled", ".ruled-hc", ".carbon-copy", ".carbon-copy-hc"]) {
    assert.ok(
      themeCss.includes(`${selector} {`) || themeCss.includes(`${selector},`),
      `expected the generated theme CSS to include the ${selector} selector`
    );
  }

  // Two inks on ruled stock: every rendition ships the same seven tokens.
  for (const token of [
    "--stock:",
    "--stock-deep:",
    "--grid:",
    "--rule:",
    "--ink:",
    "--pencil:",
    "--red:",
  ]) {
    assert.equal(
      themeCss.split(token).length - 1,
      4,
      `expected every rendition to define ${token}`
    );
  }

  assert.equal(
    themeCss.split("--radius: 0rem;").length - 1,
    themeCss.split("--radius:").length - 1,
    "radius is 0 on every element — paper does not have rounded corners"
  );
});

test("the record book's chrome is translated for every language", () => {
  const languages = ["en", "ja", "tr"];
  const shape = (value) =>
    typeof value === "object" && value !== null
      ? Object.fromEntries(
          Object.entries(value)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([k, v]) => [k, shape(v)])
        )
      : typeof value;

  const [reference, ...rest] = languages.map((lang) =>
    JSON.parse(
      fs.readFileSync(path.resolve(process.cwd(), `content/${lang}/record.json`), "utf8")
    )
  );

  for (const [index, other] of rest.entries()) {
    assert.deepEqual(
      shape(other),
      shape(reference),
      `content/${languages[index + 1]}/record.json is not structurally aligned with content/en`
    );
  }

  // Every string must actually differ from English somewhere — a fallback that
  // silently ships English chrome to a Japanese reader is the defect, not the fix.
  for (const [index, other] of rest.entries()) {
    const differing = Object.keys(reference).filter(
      (key) => JSON.stringify(other[key]) !== JSON.stringify(reference[key])
    );
    assert.ok(
      differing.length > Object.keys(reference).length / 2,
      `content/${languages[index + 1]}/record.json looks like an untranslated copy of English`
    );
  }
});
