import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["s3.ap-south-1.amazonaws.com", "your-cdn.com"],
  },
  webpack: (config, { isServer }) => {
    // Comprehensive canvas and Node.js module handling
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };

    config.resolve.fallback = {
      ...config.resolve.fallback,
      canvas: false,
      fs: false,
      path: false,
      os: false,
      crypto: false,
      stream: false,
      http: false,
      https: false,
      zlib: false,
      url: false,
    };

    // Add ignore plugin for problematic modules
    const webpack = require("webpack");
    config.plugins = config.plugins || [];
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^canvas$/,
      })
    );

    // Handle pdfjs-dist specifically
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];

    // Ignore canvas requires in pdfjs-dist
    config.module.rules.push({
      test: /node_modules\/pdfjs-dist\/.*\.js$/,
      use: {
        loader: "string-replace-loader",
        options: {
          search: 'require("canvas")',
          replace: "null",
          flags: "g",
        },
      },
    });

    return config;
  },
};

export default nextConfig;
