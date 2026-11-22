import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const staticHtmlPath = path.resolve(process.cwd(), "dist/client/index.html");
const sitemapPath = path.resolve(process.cwd(), "dist/client/sitemap.xml");
const artifactStatusPath = path.resolve(process.cwd(), "dist/client/artifact-status.json");
const clientDistDir = path.resolve(process.cwd(), "dist/client");
const languages = ["en", "ja", "tr"];

// Text as React writes it into HTML.
const escapeHtml = (text) => text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

test("static output contains real resume content instead of loading placeholders", () => {
  assert.ok(fs.existsSync(staticHtmlPath), `Expected built HTML at ${staticHtmlPath}`);

  const html = fs.readFileSync(staticHtmlPath, "utf8");
  // Only what React prerendered counts: the template's <head> (title, meta,
  // JSON-LD) repeats the subtitle, so a check on the whole file would pass
  // with an empty #root.
  const root = html.slice(html.indexOf('<div id="root">'));
  assert.ok(html.includes('<div id="root">'), "expected the prerender root");

  const read = (file) => JSON.parse(fs.readFileSync(path.resolve(process.cwd(), `content/en/${file}`), "utf8"));
  const header = read("header.json");
  const contact = read("contact.json");

  assert.ok(
    root.includes(`<p class="head__title">${escapeHtml(header.subtitle)}</p>`),
    "expected the prerendered head to include the position (header.subtitle)"
  );
  for (const label of [contact.getInTouch, contact.findMeOn]) {
    assert.ok(root.includes(escapeHtml(label)), `expected the static output to include contact content ("${label}")`);
  }
  assert.ok(
    !html.includes(header.contactViaEmail),
    "expected the email to be hidden from the web page (kept only in the downloadable PDF/DOCX)"
  );
  assert.ok(
    !html.includes("animate-pulse"),
    "expected the static output to render real content instead of loading skeletons"
  );
});

test("the PDF build fonts are not shipped with the site", () => {
  // public/fonts/ holds the TTFs the PDF generator embeds. The page never loads
  // them, and shipping them adds ~83 MB to every Pages deploy. Two copy paths
  // can leak them: build-static's own copy and Vite's publicDir copy.
  assert.ok(
    !fs.existsSync(path.join(clientDistDir, "fonts")),
    "expected dist/client/fonts to be absent"
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
  const abstractOnlyPhrase = "Systems architect at Veltra working across";
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

test("each language lists three spoken languages with the TOEFL and JLPT certificates", () => {
  // The certificates sit inside the brackets with a comma of their own
  // ("TOEFL 263, 2004"). If a parser splits on every comma, the JSON Resume
  // gains a bogus "2004)" language and the head of the page prints a stray line.
  for (const lang of languages) {
    const resume = JSON.parse(fs.readFileSync(path.join(clientDistDir, `resume-${lang}.json`), "utf8"));
    assert.equal(resume.languages.length, 3, `expected three languages in resume-${lang}.json`);
    const fluency = resume.languages.map((l) => l.fluency ?? "").join(" | ");
    assert.match(fluency, /TOEFL 263/, `expected the TOEFL score in resume-${lang}.json`);
    assert.match(fluency, /JLPT/, `expected the JLPT level in resume-${lang}.json`);
  }

  const html = fs.readFileSync(staticHtmlPath, "utf8");
  assert.ok(html.includes("TOEFL 263 on the old CBT scale, 2004"), "expected the page to show the TOEFL certificate");
  assert.ok(html.includes("JLPT Level 2, 2006"), "expected the page to show the JLPT certificate");
});

test("static build emits a vCard with the contact details", () => {
  const vcardPath = path.join(clientDistDir, "arda.vcf");
  assert.ok(fs.existsSync(vcardPath), `Expected vCard at ${vcardPath}`);

  const vcard = fs.readFileSync(vcardPath, "utf8");

  assert.ok(vcard.startsWith("BEGIN:VCARD"), "expected the vCard to start with BEGIN:VCARD");
  assert.ok(vcard.includes("EMAIL"), "expected the vCard to include an EMAIL property");
  assert.ok(vcard.includes("\r\n"), "expected the vCard to use CRLF line endings per spec");
});

// record.json is the page chrome; chat.json the chat widget's labels (incl. the ♪ voice toggle).
for (const file of ["record.json", "chat.json"]) test(`the page chrome (${file}) is translated for every language`, () => {
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
      fs.readFileSync(path.resolve(process.cwd(), `content/${lang}/${file}`), "utf8")
    )
  );

  for (const [index, other] of rest.entries()) {
    assert.deepEqual(
      shape(other),
      shape(reference),
      `content/${languages[index + 1]}/${file} is not structurally aligned with content/en`
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
      `content/${languages[index + 1]}/${file} looks like an untranslated copy of English`
    );
  }
});

// The JSON-LD Person in client/index.html is hand-written; it must not drift
// from the content it describes.
test("the JSON-LD Person is the arda.tr person, links every profile and names the degree as the content does", () => {
  const template = fs.readFileSync(path.resolve(process.cwd(), "client/index.html"), "utf8");
  const person = JSON.parse(template.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  const contact = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), "content/en/contact.json"), "utf8"));
  for (const { url } of contact.socialLinks) {
    assert.ok(person.sameAs.includes(url), `expected sameAs to include ${url}`);
  }
  const education = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), "content/en/education.json"), "utf8"));
  const degrees = education.entries.map((entry) => entry.degree);
  for (const credential of person.hasCredential) {
    assert.ok(degrees.includes(credential.name), `"${credential.name}" is not a degree in content/en/education.json`);
  }
  // One identity across the arda.tr family: the Person is the one arda.tr
  // describes, and this page is a profile page about it. The canonical link
  // and og:url keep naming the page itself.
  assert.equal(person["@id"], "https://arda.tr/#person");
  assert.equal(person.url, "https://arda.tr/");
  assert.deepEqual(person.mainEntityOfPage, {
    "@type": "ProfilePage",
    "@id": "https://resume.arda.tr/#webpage",
    url: "https://resume.arda.tr/",
    // Google reads ProfilePage from the page object's own mainEntity; it
    // does not infer it from the inverse property above.
    mainEntity: { "@id": "https://arda.tr/#person" },
  });
  // og-image.png is the social title card, not a picture of Arda; it stays
  // og:image / twitter:image but must not stand for the Person.
  assert.ok(!("image" in person), "the JSON-LD Person has no image");
  for (const site of ["https://arda.tr", "https://blog.arda.tr"]) {
    assert.ok(
      person.sameAs.some((url) => url.replace(/\/$/, "") === site),
      `expected sameAs to include ${site}`
    );
  }
  assert.match(template, /<link rel="canonical" href="https:\/\/resume\.arda\.tr\/" \/>/);
  assert.match(template, /<meta property="og:url" content="https:\/\/resume\.arda\.tr\/" \/>/);
});

// A <header> or <footer> inside <main> is not exposed as a top-level banner /
// contentinfo landmark, so screen-reader landmark navigation would miss the
// top line and the colophon. Everything that is the résumé sits in the one <main>.
test("the top line and the colophon are top-level landmarks, outside <main>", () => {
  const html = fs.readFileSync(staticHtmlPath, "utf8");
  const mains = html.match(/<main[\s>][\s\S]*?<\/main>/g) ?? [];
  assert.equal(mains.length, 1, "expected exactly one <main>");
  assert.doesNotMatch(mains[0], /<header class="top"/, "the top line must not sit inside <main>");
  assert.doesNotMatch(mains[0], /<footer[\s>]/, "the colophon must not sit inside <main>");
  assert.match(html, /<header class="top"/);
  assert.match(html, /<footer class="[^"]*\bcolophon\b[^"]*"/);
  for (const id of ["about", "experience", "skills", "projects", "education", "contact"]) {
    assert.match(mains[0], new RegExp(`<section [^>]*id="${id}"`), `the ${id} section stays in <main>`);
  }
});

// The name, the position and the files under them are the first thing a
// recruiter reads. Outside every landmark,
// "jump to main" and landmark navigation would skip past them.
test("the name (h1), the position and the downloads sit inside <main>", () => {
  const html = fs.readFileSync(staticHtmlPath, "utf8");
  const main = html.match(/<main[\s>][\s\S]*?<\/main>/)?.[0] ?? "";
  const head = main.slice(0, main.indexOf("<section "));
  assert.match(head, /<h1 /, "the h1 comes before the first section");
  assert.match(head, /class="head__title"/, "and the position");
  assert.match(head, /href="\/resume-en\.pdf"/, "and the downloads");
  for (const id of ["about", "experience", "skills", "projects", "education", "contact"]) {
    assert.match(head, new RegExp(`<a href="#${id}">`), `and the way to the ${id} section`);
  }
});

// The arda.tr family links to itself through each site's own chrome. Here it
// is one web-only line in the colophon: in the prerendered HTML so crawlers
// and readers without JS get it, hidden in print (it says nothing about Arda
// the candidate), and never in contact.socialLinks, which feeds the JSON
// Resume profiles. rel="me" only on the two sites that are Arda's own voice.
test("the colophon links the arda.tr family in a web-only line", () => {
  const html = fs.readFileSync(staticHtmlPath, "utf8");
  const footer = html.match(/<footer class="[^"]*\bcolophon\b[^"]*">([\s\S]*?)<\/footer>/)?.[1] ?? "";
  const record = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), "content/en/record.json"), "utf8"));
  const line = footer.match(/<p class="no-print">([\s\S]*?)<\/p>/)?.[1];
  assert.ok(line, "expected a no-print paragraph in the colophon");
  assert.ok(line.startsWith(`${record.fields.links} `), "the line is labelled with the head's Links label");
  const links = [...line.matchAll(/<a ([^>]*)>([^<]*)<\/a>/g)].map(([, attrs, text]) => ({
    href: attrs.match(/href="([^"]+)"/)?.[1],
    me: /\brel="me"/.test(attrs),
    text,
  }));
  assert.deepEqual(links, [
    { href: "https://arda.tr", me: true, text: "arda.tr" },
    { href: "https://blog.arda.tr", me: true, text: "blog.arda.tr" },
    { href: "https://ai.arda.tr", me: false, text: "ai.arda.tr" },
    { href: "https://lind.arda.tr", me: false, text: "lind.arda.tr" },
  ]);
  // Between the links: only the decorative ` · `, hidden from screen readers
  // so the line is read as four links, not "middle dot" three times.
  const separators = line.replace(/<a [^>]*>[^<]*<\/a>/g, "\0").split("\0").slice(1, -1);
  assert.deepEqual(separators, Array(3).fill('<span aria-hidden="true"> · </span>'));
  assert.doesNotMatch(html, /coze\.org/, "the résumé links nowhere on coze.org");
  const contact = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), "content/en/contact.json"), "utf8"));
  for (const { href } of links) {
    assert.ok(
      !contact.socialLinks.some(({ url }) => url.includes(new URL(href).host)),
      `${href} must stay out of contact.socialLinks (the JSON Resume profiles)`
    );
  }
});
