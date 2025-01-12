import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    pageExtensions: ["ts", "tsx", "mdx"],
    experimental: {
        mdxRs: true,
    },
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
