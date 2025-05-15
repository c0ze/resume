import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import path from "path";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  // Check for PDF files for different languages
  app.get('/api/check-pdf-files', async (req, res) => {
    try {
      // Use ES Modules syntax for importing fs
      import('fs/promises').then(async (fs) => {
        const publicDir = path.join(process.cwd(), "public");
        
        // Check if files exist
        const exists = async (filePath: string) => {
          try {
            await fs.access(filePath);
            return true;
          } catch {
            return false;
          }
        };
        
        const files = {
          en: await exists(path.join(publicDir, 'resume.pdf')),
          ja: await exists(path.join(publicDir, 'resume-ja.pdf')),
          tr: await exists(path.join(publicDir, 'resume-tr.pdf'))
        };
        
        console.log('PDF files status:', files);
        res.json(files);
      }).catch(err => {
        console.error('FS module import error:', err);
        res.status(500).json({ error: 'Failed to import fs module' });
      });
    } catch (error) {
      console.error('Error checking PDF files:', error);
      res.status(500).json({ error: 'Failed to check PDF files' });
    }
  });

  // Serve static files from the public directory
  app.use(express.static(path.join(process.cwd(), "public")));

  const httpServer = createServer(app);

  return httpServer;
}
