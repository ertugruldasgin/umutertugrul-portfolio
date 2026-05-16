import withPWA from "@ducanh2912/next-pwa";

const nextConfig = {
  turbopack: {},
};

export default withPWA({
  dest: "public",
  register: true,
  disable: process.env.NODE_ENV === "development",
})(nextConfig);
