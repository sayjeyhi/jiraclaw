/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ["elysia", "@elysiajs/eden"],
  // disable nextjs debugger
  devIndicators: false,
};

export default nextConfig;
