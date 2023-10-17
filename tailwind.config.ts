import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
	content: ["./src/**/*.tsx"],
	theme: {
		extend: {
			fontFamily: {
				sans: ["var(--font-sans)", ...fontFamily.sans]
			},
			colors: {
				'text': '#030512',
				'background': '#f1efee',
				'primary': '#91cfed',
				'secondary': '#c2caf5',
				'accent': '#1331dd'
			}
		}
	},
	plugins: []
} satisfies Config;
