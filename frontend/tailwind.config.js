/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        pri: { DEFAULT: "#37ADE3", light: "#EDF7FD", dark: "#2890C0" },
        ch: "#4C4849",
        ok: { DEFAULT: "#34A853", light: "#ECFDF5", border: "#BBF7D0" },
        warn: { DEFAULT: "#F59E0B", light: "#FFFBEB", border: "#FEF08A" },
        err: { DEFAULT: "#E85D5D", light: "#FEF2F2", border: "#FECACA" },
      },
      fontFamily: {
        sans: ["DM Sans", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
