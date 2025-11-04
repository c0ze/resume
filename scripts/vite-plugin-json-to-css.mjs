import fs from 'fs';
import path from 'path';

function generateThemeCss(theme) {
  let css = ':root {\n';
  for (const [key, value] of Object.entries(theme)) {
    if (key === 'variant' || key === 'appearance') continue;
    css += `  --${key}: ${value};\n`;
  }
  css += '}';
  return css;
}

export default function jsonToCssPlugin(options) {
  return {
    name: 'json-to-css',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/index.html' || req.url === '/') {
          const themePath = path.resolve(process.cwd(), options.filePath);
          const theme = JSON.parse(fs.readFileSync(themePath, 'utf-8'));
          const css = generateThemeCss(theme);

          const originalEnd = res.end;
          res.end = function (chunk, encoding) {
            if (chunk) {
              let html = chunk.toString();
              html = html.replace('</head>', `<style>\n${css}\n</style>\n</head>`);
              arguments[0] = html;
            }
            originalEnd.apply(this, arguments);
          };
        }
        next();
      });
    },
    transformIndexHtml(html) {
      const themePath = path.resolve(process.cwd(), options.filePath);
      const theme = JSON.parse(fs.readFileSync(themePath, 'utf-8'));
      const css = generateThemeCss(theme);
      return html.replace(
        '</head>',
        `  <style>\n${css}\n  </style>\n</head>`
      );
    },
  };
}