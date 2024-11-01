"use client";

const NextThemesProvider = dynamic(() => import("next-themes").then((e) => e.ThemeProvider), {
    ssr: false,
});

import { type ThemeProviderProps } from "next-themes/dist/types";
import dynamic from "next/dynamic";

function ThemeProvider({ children, ...props }: ThemeProviderProps) {
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

export { ThemeProvider };
