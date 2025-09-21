import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    domains: [], // Add external image domains here if needed
    unoptimized: true, // Set this to true if you're exporting a static site
  },
  /* config options here */
};

export default nextConfig;
