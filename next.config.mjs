/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/portal",
        destination: "/tracking",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
