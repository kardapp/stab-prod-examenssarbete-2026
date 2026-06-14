import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/firstpage",
        destination: "/",
        permanent: false,
      },
      {
        source: "/production-planning/outpatient",
        destination: "/outpatient/production-planning",
        permanent: false,
      },
      {
        source: "/outpatient/productionplanning",
        destination: "/outpatient/production-planning",
        permanent: false,
      },
      {
        source: "/outpatient/productionplanning/oodistribution",
        destination: "/outpatient/production-planning/oo-distribution",
        permanent: false,
      },
      {
        source: "/outpatient/productionplanning/results",
        destination: "/outpatient/production-planning/results",
        permanent: false,
      },
      {
        source: "/inpatient/productionplanning",
        destination: "/inpatient/production-planning",
        permanent: false,
      },
      {
        source: "/inpatient/productionplanning/oodistribution",
        destination: "/inpatient/production-planning/oo-distribution",
        permanent: false,
      },
      {
        source: "/inpatient/productionplanning/results",
        destination: "/inpatient/production-planning/results",
        permanent: false,
      },
      {
        source: "/outpatient/production/production-planning",
        destination: "/outpatient/production-planning",
        permanent: false,
      },
      {
        source: "/outpatient/production/oo-distribution",
        destination: "/outpatient/production-planning/oo-distribution",
        permanent: false,
      },
      {
        source: "/outpatient/production/results-production-planning",
        destination: "/outpatient/production-planning/results",
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
