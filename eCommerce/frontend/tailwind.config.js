/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	darkMode: "class",
	theme: {
		extend: {
			fontFamily: {
				sans: ['"Outfit"', "sans-serif"],
				serif: ['"Prata"', "serif"],
			},
			colors: {
				brand: {
					50: "#f8f7f5",
					100: "#efece6",
					200: "#ded8cd",
					300: "#c7bda9",
					400: "#ad9d83",
					500: "#968366",
					600: "#7c6a52",
					700: "#655544",
					800: "#54473a",
					900: "#483d34",
					950: "#27211d",
				},
				accent: {
					50: "#fff9ed",
					100: "#fff1d4",
					200: "#ffdfa8",
					300: "#ffc86e",
					400: "#ffab2e",
					500: "#ff9207",
					600: "#f07000",
					700: "#c75300",
					800: "#9c4110",
					900: "#7d3711",
				},
			},
			borderRadius: {
				"4xl": "2rem",
			},
			boxShadow: {
				soft: "0 4px 20px -2px rgba(0, 0, 0, 0.06)",
				elevated: "0 10px 40px -4px rgba(0, 0, 0, 0.1)",
				glow: "0 0 40px -10px rgba(255, 146, 7, 0.35)",
			},
			animation: {
				"fade-in": "fadeIn 0.5s ease-out",
				"slide-up": "slideUp 0.5s ease-out",
			},
			keyframes: {
				fadeIn: {
					"0%": { opacity: "0" },
					"100%": { opacity: "1" },
				},
				slideUp: {
					"0%": { opacity: "0", transform: "translateY(12px)" },
					"100%": { opacity: "1", transform: "translateY(0)" },
				},
			},
		},
	},
	plugins: [],
};
