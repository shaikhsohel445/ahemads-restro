import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// OpenNext adapter config for Cloudflare Workers. The app is almost entirely
// client-rendered, so no incremental cache / tag cache is configured: pages
// are served from the Worker's static assets or rendered per request.
export default defineCloudflareConfig({});
