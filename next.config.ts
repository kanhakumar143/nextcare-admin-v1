import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["s3.ap-south-1.amazonaws.com", "your-cdn.com"],
  },
};

export default nextConfig;
