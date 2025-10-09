/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  // BasePath uniquement en production (GitHub Pages)
  basePath: process.env.NODE_ENV === 'production' ? '/premierdelan' : '',
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig

