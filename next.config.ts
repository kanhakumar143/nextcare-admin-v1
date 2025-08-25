import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["s3.ap-south-1.amazonaws.com", "your-cdn.com"],
  },
  webpack: (config) => {
    // Ignore canvas module for pdfjs-dist
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };

    // Alternative approach - externalize canvas
    config.externals = config.externals || [];
    config.externals.push({
      canvas: "canvas",
    });

    return config;
  },
};

export default nextConfig;
