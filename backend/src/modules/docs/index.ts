import fs from 'node:fs';
import path from 'node:path';
import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { parse } from 'yaml';

// openapi.yml lives at the backend package root; this file sits two levels
// under src (or dist) so it resolves the same way in dev and in the build.
const OPENAPI_PATH = path.resolve(__dirname, '../../../openapi.yml');

export function createDocsModule(): Router {
  const router = Router();
  const spec = parse(fs.readFileSync(OPENAPI_PATH, 'utf8'));

  // The app-wide helmet() CSP (script-src 'self', no 'unsafe-inline') blocks
  // Swagger UI's inline bootstrap script. Strip it for these doc routes only
  // — removeHeader, not a second helmet() call, since the header is already
  // set by the global middleware by the time this runs. Scoped to /docs* so
  // it doesn't leak and strip CSP from unrelated routes registered after
  // this router (e.g. /health in app.ts).
  router.use(['/docs', '/docs.json'], (_req, res, next) => {
    res.removeHeader('Content-Security-Policy');
    next();
  });

  router.get('/docs.json', (_req, res) => res.status(200).json(spec));
  router.use('/docs', swaggerUi.serve, swaggerUi.setup(spec));

  return router;
}
