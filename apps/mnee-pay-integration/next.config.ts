import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@mnee-pay/checkout'],
  
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      
      '@react-native-async-storage/async-storage': false,
    };
    return config;
  },
};

export default nextConfig;
