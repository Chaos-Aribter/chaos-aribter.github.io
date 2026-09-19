import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

const nextConfig = (phase: string): NextConfig => ({
  output: "export",
  // This user Pages repository and cacx.online are both served at the root.
  // Root-relative assets also work when opening nested news detail URLs.
  // With static export, a custom distDir changes the export destination.
  // Only isolate dev caches; production builds must always export to out/.
  distDir: phase === PHASE_DEVELOPMENT_SERVER ? process.env.NEXT_DIST_DIR ?? ".next" : ".next",
  outputFileTracingRoot: __dirname,
  devIndicators: false,
});

export default nextConfig;
