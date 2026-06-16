import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ url }) => {
	const isDev = import.meta.env.DEV;
	const origin = isDev ? url.origin : 'https://wardrobe-closet.com';
	
	const robots = `User-agent: *
Allow: /
Allow: /about
Allow: /contact
Allow: /privacy
Allow: /terms
Disallow: /dashboard
Disallow: /wardrobe
Disallow: /outfits
Disallow: /planner
Disallow: /insights
Disallow: /collections
Disallow: /settings
Disallow: /api

Sitemap: ${origin}/sitemap.xml
`;

	return new Response(robots.trim(), {
		headers: {
			'Content-Type': 'text/plain',
			'Cache-Control': 'public, max-age=86400',
		},
	});
};
