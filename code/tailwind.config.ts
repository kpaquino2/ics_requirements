import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        maroon: "#7b1113",
      },
      backgroundImage: {
        borderright:
          "repeating-linear-gradient(270deg, var(--tw-gradient-stops) 0 2px, transparent 0 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
