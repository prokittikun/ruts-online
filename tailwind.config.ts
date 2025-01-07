import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", ...fontFamily.sans],
      },
      colors: {
        dark: "#252425",
      },
    },
  },
  darkMode: ["class", '[data-mantine-color-scheme="dark"]'],
  plugins: [],
} satisfies Config;
