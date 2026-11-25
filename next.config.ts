import type { NextConfig } from "next";

/** Teški fajlovi iz `public/` se keširaju u pregledaču nedelju dana, a posle
    toga se tiho osvežavaju — posetioci ih ne preuzimaju svaki put iznova. */
const kes = [
  {
    key: "Cache-Control",
    value: "public, max-age=604800, stale-while-revalidate=86400",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      { source: "/alumni/:path*", headers: kes },
      { source: "/projekti/:path*", headers: kes },
      { source: "/images/:path*", headers: kes },
    ];
  },
};

export default nextConfig;
