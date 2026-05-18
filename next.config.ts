import withPWA from "@ducanh2912/next-pwa";

const nextConfig = {
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: "https" as const,
        hostname: "supabase.umutertugrul.com",
      },
    ],
  },
};

export default withPWA({
  dest: "public",
  register: true,
  disable: process.env.NODE_ENV === "development",
})(nextConfig);
