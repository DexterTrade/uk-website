/** @type {import('next').NextConfig} */
const nextConfig = {
  // AVIF first, WebP for browsers without it; next/image serves each visitor
  // the smallest format and width their device needs.
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return [
      {
        source: "/portal",
        destination: "/tracking",
        permanent: true,
      },
      {
        source: "/moving-back-home",
        destination: "/house-move",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
