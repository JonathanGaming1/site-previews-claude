/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/templates/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heebo: ["Heebo", "Assistant", "system-ui", "sans-serif"],
        assistant: ["Assistant", "Heebo", "system-ui", "sans-serif"],
        frank: ["Frank Ruhl Libre", "Assistant", "serif"],
        cormorant: ["Cormorant Garamond", "Frank Ruhl Libre", "serif"],
        space: ["Space Grotesk", "Assistant", "sans-serif"],
      },
      letterSpacing: {
        editorial: "-0.045em",
        technical: "0.22em",
      },
      boxShadow: {
        "glass-luxe": "0 30px 100px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.18)",
        "soft-glow": "0 0 80px rgba(148,163,184,.16)",
      },
    },
  },
  plugins: [],
};
