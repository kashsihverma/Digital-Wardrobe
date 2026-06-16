import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ url }) => {
	const isDev = import.meta.env.DEV;
	const origin = isDev ? url.origin : 'https://wardrobe-closet.com';
	const pages = [
		'',
		'/about',
		'/contact',
		'/privacy',
		'/terms',
	];

	const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
	${pages
		.map((page) => `
	<url>
		<loc>${origin}${page}</loc>
		<lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
		<changefreq>${page === '' ? 'daily' : 'monthly'}</changefreq>
		<priority>${page === '' ? '1.0' : '0.8'}</priority>
	</url>`)
		.join('')}
</urlset>`;

	return new Response(sitemap.trim(), {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'public, max-age=86400',
		},
	});
};
