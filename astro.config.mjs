// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';

export default defineConfig({
	devToolbar: {
		enabled: false,
	},
	integrations: [react()],
	vite: {
		plugins: [tailwindcss()],
	},
});
