import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/automation", "/notes", "/diagrams"],
    },
    sitemap: "https://umutertugrul.com/sitemap.xml",
  };
}
