/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@yalcin/shared'],
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
