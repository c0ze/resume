import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const clientDistDir = path.resolve(projectRoot, "dist/client");
const flavorsDir = path.resolve(projectRoot, "content/flavors");

// A distinctive phrase that only appears in a web-only `abstract` in content/en.
const abstractOnlyPhrase = "Lead engineer on Veltra's AI platform";

function loadFlavors() {
  if (!fs.existsSync(flavorsDir)) return [];
  return fs
    .readdirSync(flavorsDir)
    .filter((file) => file.endsWith(".json"))
    .map((file) => JSON.parse(fs.readFileSync(path.join(flavorsDir, file), "utf8")));
}

test("flavor overlays are well-formed and language-aligned", () => {
  const flavors = loadFlavors();
  assert.ok(flavors.length > 0, "expected at least one flavor overlay in content/flavors");

  for (const flavor of flavors) {
    assert.ok(typeof flavor.name === "string" && flavor.name, "flavor needs a name");
    assert.ok(
      Array.isArray(flavor.exportLangs) && flavor.exportLangs.length > 0,
      `flavor "${flavor.name}" needs a non-empty exportLangs`
    );
    for (const lang of flavor.exportLangs) {
      const override = flavor.overrides?.[lang];
      assert.ok(override, `flavor "${flavor.name}" must define overrides for shipped language "${lang}"`);
      assert.ok(override.subtitle, `flavor "${flavor.name}" [${lang}] needs a subtitle override`);
      assert.ok(
        override.about?.paragraph1 && override.about?.paragraph2,
        `flavor "${flavor.name}" [${lang}] needs both About paragraphs`
      );
    }
  }
});

test("static build emits per-flavor artifacts for each shipped language", () => {
  for (const flavor of loadFlavors()) {
    for (const lang of flavor.exportLangs) {
      for (const ext of ["pdf", "docx", "json"]) {
        const file = path.join(clientDistDir, `resume-${flavor.name}-${lang}.${ext}`);
        assert.ok(fs.existsSync(file), `Expected flavored artifact ${path.basename(file)}`);
      }
    }
  }
});

test("flavored JSON Resume applies the summary overlay and keeps the abstract invariant", () => {
  for (const flavor of loadFlavors()) {
    for (const lang of flavor.exportLangs) {
      const flavored = JSON.parse(
        fs.readFileSync(path.join(clientDistDir, `resume-${flavor.name}-${lang}.json`), "utf8")
      );
      const base = JSON.parse(
        fs.readFileSync(path.join(clientDistDir, `resume-${lang}.json`), "utf8")
      );

      assert.equal(
        flavored.basics.label,
        flavor.overrides[lang].subtitle,
        `expected ${flavor.name} [${lang}] JSON label to use the flavor subtitle`
      );
      assert.notEqual(
        flavored.basics.label,
        base.basics.label,
        `expected ${flavor.name} [${lang}] label to differ from the base résumé`
      );
      assert.ok(
        !JSON.stringify(flavored).includes(abstractOnlyPhrase),
        `expected ${flavor.name} [${lang}] export to exclude the web-only abstract text`
      );
    }
  }
});
