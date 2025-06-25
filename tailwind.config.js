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
      colors: {
        skyblue: '#34a4ee', // 👈 custom color name
        primary_color: '#7e4cd7',
        primary: '#1DA1F2'
      },
      // Optional: extend colors, fonts, etc. here
    },
  },
  plugins: [
  ],
}
