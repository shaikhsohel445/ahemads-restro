import type { INestApplication } from '@nestjs/common';
import type { OpenAPIObject } from '@nestjs/swagger';
import type { Request, Response } from 'express';

// SwaggerModule.setup() serves swagger-ui-dist's files from the local
// filesystem, which a Worker does not have. The OpenAPI document itself is
// generated the same way as before; only the UI shell is served differently:
// a small HTML page that loads swagger-ui from cdnjs and points it at
// /api/docs-json.
const SWAGGER_UI_VERSION = '5.17.14';

export function mountSwaggerUi(app: INestApplication, document: OpenAPIObject) {
  const http = app.getHttpAdapter();
  http.get('/api/docs-json', (_req: Request, res: Response) => {
    res.json(document);
  });
  http.get('/api/docs', (_req: Request, res: Response) => {
    res.type('html').send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Nodedr OrderRestro API</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/${SWAGGER_UI_VERSION}/swagger-ui.min.css" />
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/${SWAGGER_UI_VERSION}/swagger-ui-bundle.min.js" crossorigin></script>
  <script>
    window.ui = SwaggerUIBundle({ url: '/api/docs-json', dom_id: '#swagger-ui', withCredentials: true });
  </script>
</body>
</html>`);
  });
}
