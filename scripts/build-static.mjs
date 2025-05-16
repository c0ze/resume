import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..'); // Assuming scripts/ is one level down from project root

const clientDistPath = path.resolve(projectRoot, 'dist/client');
const serverDistPath = path.resolve(projectRoot, 'dist/server');
const publicPath = path.resolve(projectRoot, 'public');

async function build() {
  try {
    console.log('Starting static site generation...');

    // 1. Clean existing dist directory
    console.log('Cleaning dist directory...');
    await fs.emptyDir(path.resolve(projectRoot, 'dist'));

    // 2. Build client assets
    console.log('Building client assets...');
    execSync('npx vite build', { stdio: 'inherit', cwd: projectRoot });

    // 3. Build server bundle
    console.log('Building server bundle...');
    // Set SSR_BUILD env var for Vite config to pick up SSR build
    execSync('npx cross-env SSR_BUILD=true vite build --ssr', { stdio: 'inherit', cwd: projectRoot });

    // 4. Load the server bundle
    console.log('Loading server bundle...');
    const serverEntryPath = path.join(serverDistPath, 'entry-server.js');
    const { render } = await import(pathToFileURL(serverEntryPath).href);

    // 5. Read the client's index.html template
    console.log('Reading HTML template...');
    const templatePath = path.join(clientDistPath, 'index.html');
    let template = await fs.readFile(templatePath, 'utf-8');

    // 6. Render the app HTML
    // For now, we only have the main page at '/'
    // If you add more top-level pages, you'll need to iterate and render them.
    console.log('Rendering page HTML for / ...');
    const appRender = render('/'); // Pass the route you want to render
    const appHtml = appRender.html;

    // 7. Inject app HTML into the template
    template = template.replace('<!--ssr-outlet-->', appHtml); // Standard placeholder
    // Or, if your template uses <div id="root"></div> and you want to replace its content:
    template = template.replace(
      '<div id="root"></div>',
      `<div id="root">${appHtml}</div>`
    );

    // 8. Save the final HTML to dist/client/index.html
    // This effectively makes dist/client the final output directory for the static site.
    await fs.writeFile(templatePath, template); // Overwrite the client's index.html with the rendered one
    console.log(`Rendered HTML saved to ${templatePath}`);

    // NEW: Generate PDF resumes for all languages
    console.log('Generating PDF resumes...');
    execSync('node generateResume.js', { stdio: 'inherit', cwd: projectRoot });

    // 9. Check for PDF files and create pdf-status.json
    console.log('Checking for PDF files...');
    const pdfFiles = {
      en: await fs.pathExists(path.join(publicPath, 'resume-en.pdf')),
      ja: await fs.pathExists(path.join(publicPath, 'resume-ja.pdf')),
      tr: await fs.pathExists(path.join(publicPath, 'resume-tr.pdf')),
    };
    const pdfStatusPath = path.join(clientDistPath, 'pdf-status.json');
    await fs.writeJson(pdfStatusPath, pdfFiles);
    console.log(`PDF status saved to ${pdfStatusPath}`);

    // 10. Copy public directory contents to dist/client
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
      }, // Added missing comma here if it was the issue, but the error is '}' expected.
    });
    console.log('Public assets copied.');


    console.log('Static site generation complete!');
    console.log(`Site generated in: ${clientDistPath}`);

  } catch (error) {
    console.error('Error during static site generation:', error);
    process.exit(1);
  }
}

build();