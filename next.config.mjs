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
  turbopack: {
    // elysiajs-helmet ships only .ts source in its exports map; point to the compiled dist instead
    resolveAlias: {
      "elysiajs-helmet": "./node_modules/elysiajs-helmet/dist/index.js",
    },
  },
};

export default nextConfig;
