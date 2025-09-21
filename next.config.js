/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  sassOptions: {
    includePaths: ['./styles'],
  },
  images: {
    domains: [], // Add external image domains here if needed
    unoptimized: true, // Set this to true if you're exporting a static site
  },
};

module.exports = nextConfig; 