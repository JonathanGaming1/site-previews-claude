import { SiteExperience } from "@/components/SiteExperience";

/**
 * Static-export entry point. SiteProvider resolves the current /p/{slug} or
 * ?site={slug} at runtime and loads it through the same-origin server proxy
 * at /api/site?site={slug}; no private GitHub token reaches the browser.
 */
export default function Home() {
  return <SiteExperience />;
}
