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
				'text': {
					50: '#e9ecfb',
					100: '#d3d8f8',
					200: '#a8b1f0',
					300: '#7c8be9',
					400: '#5164e1',
					500: '#253dda',
					600: '#1e31ae',
					700: '#162583',
					800: '#0f1857',
					900: '#070c2c',
					950: '#040616'
				},
				'background': {
					50: '#f4f2f1',
					100: '#e8e5e3',
					200: '#d1cac7',
					300: '#bab0ab',
					400: '#a3968f',
					500: '#8c7b73',
					600: '#70635c',
					700: '#544a45',
					800: '#38312e',
					900: '#1c1917',
					950: '#0e0c0b'
				},
				'primary': {
					50: '#e9f5fb',
					100: '#d3ecf8',
					200: '#a7d8f1',
					300: '#7bc5ea',
					400: '#50b1e2',
					500: '#249edb',
					600: '#1d7eaf',
					700: '#155f84',
					800: '#0e3f58',
					900: '#07202c',
					950: '#041016'
				},
				'secondary': {
					50: '#e9ecfb',
					100: '#d3d9f8',
					200: '#a7b2f1',
					300: '#7b8cea',
					400: '#5066e2',
					500: '#243fdb',
					600: '#1d33af',
					700: '#152684',
					800: '#0e1958',
					900: '#070d2c',
					950: '#040616'
				},
				'accent': {
					50: '#e9ecfb',
					100: '#d3d9f8',
					200: '#a7b4f1',
					300: '#7b8eea',
					400: '#5068e2',
					500: '#2442db',
					600: '#1d35af',
					700: '#152884',
					800: '#0e1b58',
					900: '#070d2c',
					950: '#040716'
				}
			}

		}
	},
	plugins: []
} satisfies Config;
