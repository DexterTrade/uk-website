/** @type {import('next').NextConfig} */
const nextConfig = {
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
