import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // GitHub project Pages are served below /Chaos-Aribter.githu.io/, while the
  // custom domain is served from /. Relative assets work in both locations.
  assetPrefix: process.env.GITHUB_ACTIONS ? "./" : "",
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  outputFileTracingRoot: __dirname,
  devIndicators: false,
};

export default nextConfig;
