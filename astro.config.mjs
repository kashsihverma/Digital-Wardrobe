// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	site: 'https://wardrobe-closet.com',
	output: 'server',
	adapter: cloudflare(),
	devToolbar: {
		enabled: false,
	},
	integrations: [react()],
	vite: {
		plugins: [tailwindcss()],
		resolve: {
			alias: {
				'.prisma/client/default': path.resolve(__dirname, './node_modules/.prisma/client/wasm.js'),
				'@prisma/client$': path.resolve(__dirname, './node_modules/.prisma/client/wasm.js'),
			},
		},
		server: {
			watch: {
				ignored: ['**/.wrangler/**'],
			},
		},
		ssr: {
			noExternal: ['@prisma/client'],
		},
	},
});
