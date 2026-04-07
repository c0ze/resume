import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..'); // Assuming scripts/ is one level down from project root

const clientDistPath = path.resolve(projectRoot, 'dist/client');
const serverDistPath = path.resolve(projectRoot, 'dist/server');
const publicPath = path.resolve(projectRoot, 'public');
const viteConfigPath = 'config/vite.config.ts';
const siteUrl = 'https://resume.arda.tr';

function escapeXml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function buildSitemapXml(entries) {
  const urlEntries = entries
    .map(({ loc, lastmod, changefreq, priority }) => {
      return [
        '  <url>',
        `    <loc>${escapeXml(loc)}</loc>`,
        `    <lastmod>${escapeXml(lastmod)}</lastmod>`,
        `    <changefreq>${escapeXml(changefreq)}</changefreq>`,
        `    <priority>${escapeXml(priority)}</priority>`,
        '  </url>',
      ].join('\n');
    })
    .join('\n');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urlEntries,
    '</urlset>',
    '',
  ].join('\n');
}

async function writeSitemap(outputPath, resumeArtifacts) {
  const homepageEntry = {
    loc: new URL('/', siteUrl).toString(),
    lastmod: new Date().toISOString(),
    changefreq: 'weekly',
    priority: '1.0',
  };

  const artifactEntries = await Promise.all(
    Object.entries(resumeArtifacts).flatMap(([extension, files]) =>
      Object.entries(files)
        .filter(([, exists]) => exists)
        .map(async ([language]) => {
          const fileName = `resume-${language}.${extension}`;
          const filePath = path.join(publicPath, fileName);
          const stats = await fs.stat(filePath);

          return {
            loc: new URL(`/${fileName}`, siteUrl).toString(),
            lastmod: stats.mtime.toISOString(),
            changefreq: 'monthly',
            priority: extension === 'pdf' ? '0.8' : '0.7',
          };
        })
    )
  );

  const sitemapPath = path.join(outputPath, 'sitemap.xml');
  const sitemapXml = buildSitemapXml([homepageEntry, ...artifactEntries]);

  await fs.writeFile(sitemapPath, sitemapXml);
  console.log(`Sitemap saved to ${sitemapPath}`);
}

async function build() {
  try {
    console.log('Starting static site generation...');

    // 1. Clean existing dist directory
    console.log('Cleaning dist directory...');
    await fs.emptyDir(path.resolve(projectRoot, 'dist'));

    // 2. Generate theme CSS so production builds use the latest theme config.
    console.log('Generating theme CSS...');
    execSync('node scripts/generate-theme.mjs', { stdio: 'inherit', cwd: projectRoot });

    // 2b. Compile ReScript sources
    console.log('Compiling ReScript...');
    execSync('npx rescript build', { stdio: 'inherit', cwd: projectRoot });

    // 3. Build client assets
    console.log('Building client assets...');
    execSync(`npx vite build --config ${viteConfigPath}`, { stdio: 'inherit', cwd: projectRoot });

    // 4. Build server bundle
    console.log('Building server bundle...');
    // Set SSR_BUILD env var for Vite config to pick up SSR build
    execSync(`npx cross-env SSR_BUILD=true vite build --config ${viteConfigPath} --ssr`, {
      stdio: 'inherit',
      cwd: projectRoot,
    });

    // 5. Load the server bundle
    console.log('Loading server bundle...');
    const serverEntryPath = path.join(serverDistPath, 'entry-server.js');
    const { render } = await import(pathToFileURL(serverEntryPath).href);

    // 6. Read the client's index.html template
    console.log('Reading HTML template...');
    const templatePath = path.join(clientDistPath, 'index.html');
    let template = await fs.readFile(templatePath, 'utf-8');

    // 7. Render the app HTML
    // For now, we only have the main page at '/'
    // If you add more top-level pages, you'll need to iterate and render them.
    console.log('Rendering page HTML for / ...');
    const appRender = render('/'); // Pass the route you want to render
    const appHtml = appRender.html;

    // 8. Inject app HTML into the template
    template = template.replace('<!--ssr-outlet-->', appHtml); // Standard placeholder
    // Or, if your template uses <div id="root"></div> and you want to replace its content:
    template = template.replace(
      '<div id="root"></div>',
      `<div id="root">${appHtml}</div>`
    );

    // 9. Save the final HTML to dist/client/index.html
    // This effectively makes dist/client the final output directory for the static site.
    await fs.writeFile(templatePath, template); // Overwrite the client's index.html with the rendered one
    console.log(`Rendered HTML saved to ${templatePath}`);

    // Generate PDF resumes for all languages.
    console.log('Generating PDF resumes...');
    execSync('node scripts/generate-resume.mjs', { stdio: 'inherit', cwd: projectRoot });

    // Generate DOCX resumes for all languages.
    console.log('Generating DOCX resumes...');
    execSync('node scripts/generate-docx.mjs', { stdio: 'inherit', cwd: projectRoot });

    // 10. Check for generated resume files and create artifact-status.json
    console.log('Checking for generated resume files...');
    const pdfFiles = {
      en: await fs.pathExists(path.join(publicPath, 'resume-en.pdf')),
      ja: await fs.pathExists(path.join(publicPath, 'resume-ja.pdf')),
      tr: await fs.pathExists(path.join(publicPath, 'resume-tr.pdf')),
    };
    const docxFiles = {
      en: await fs.pathExists(path.join(publicPath, 'resume-en.docx')),
      ja: await fs.pathExists(path.join(publicPath, 'resume-ja.docx')),
      tr: await fs.pathExists(path.join(publicPath, 'resume-tr.docx')),
    };
    const resumeArtifacts = { pdf: pdfFiles, docx: docxFiles };
    const artifactStatusPath = path.join(clientDistPath, 'artifact-status.json');
    await fs.writeJson(artifactStatusPath, resumeArtifacts);
    console.log(`Artifact status saved to ${artifactStatusPath}`);

    // 11. Copy public directory contents to dist/client
    // (Vite's client build might already do this for assets it knows about,
    // but this ensures everything from public/ is copied, like PDFs)
    // We exclude index.html from public if it exists, as we've generated our own.
    console.log(`Copying public assets from ${publicPath} to ${clientDistPath}...`);
    await fs.copy(publicPath, clientDistPath, {
      overwrite: true,
      filter: (src) => {
        // Don't copy index.html from public if it exists, as we generate it
        if (path.basename(src) === 'index.html' && src.startsWith(publicPath)) {
          return false;
        }
        return true;
      },
    });
    console.log('Public assets copied.');

    // 12. Generate sitemap.xml for the homepage and downloadable resumes
    console.log('Generating sitemap.xml...');
    await writeSitemap(clientDistPath, resumeArtifacts);

    console.log('Static site generation complete!');
    console.log(`Site generated in: ${clientDistPath}`);

  } catch (error) {
    console.error('Error during static site generation:', error);
    process.exit(1);
  }
}

build();
