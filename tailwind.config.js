/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // Enables dark mode via class strategy
  content: [
    "./app/**/*.{ts,tsx}",      // For App Router files
    "./pages/**/*.{ts,tsx}",    // If you're using Pages Router
    "./components/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",      // Optional: if you have a /src directory
  ],
  theme: {
    extend: {
      // Optional: extend colors, fonts, etc. here
    },
  },
  plugins: [
    
  ],
}
