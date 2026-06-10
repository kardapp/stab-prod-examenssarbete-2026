import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/firstpage",
        permanent: false,
      },
      {
        source: "/production-planning/outpatient",
        destination: "/outpatient/productionplanning",
        permanent: false,
      },
      {
        source: "/outpatient/production/production-planning",
        destination: "/outpatient/productionplanning",
        permanent: false,
      },
      {
        source: "/outpatient/production/oo-distribution",
        destination: "/outpatient/productionplanning/oodistribution",
        permanent: false,
      },
      {
        source: "/outpatient/production/results-production-planning",
        destination: "/outpatient/productionplanning/results",
        permanent: false,
      },
      {
        source: "/outpatient/dimensioning/oo-opv",
        destination: "/outpatient/dimensioning/oo",
        permanent: false,
      },
      {
        source: "/outpatient/dimensioning/results-dimensioning",
        destination: "/outpatient/dimensioning/results",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
