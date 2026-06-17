export type WardrobeItem = {
	id: string;
	name: string;
	type: string;
	subcategory: string;
	color: string;
	season: string;
	occasion: string;
	brand: string;
	notes: string;
	imageUrl?: string;
	wears: number;
	lastWorn: string;
	status: 'ready' | 'review' | 'underused' | 'favorite';
	tone: 'sand' | 'sage' | 'berry' | 'ink' | 'cream' | 'stone';
	shape: 'jacket' | 'top' | 'dress' | 'trouser' | 'skirt' | 'shoe' | 'bag';
};

export type Outfit = {
	id: string;
	name: string;
	occasion: string;
	weather: string;
	items: string[];
	reason: string;
	status: 'planned' | 'draft' | 'worn';
};

export type EventPlan = {
	id: string;
	date: string;
	title: string;
	dressCode: string;
	weather: string;
	outfit: string;
	status: 'planned' | 'needs-outfit' | 'alternate-ready';
};

export const productNav = [
	{ href: '/dashboard', label: 'Today' },
	{ href: '/wardrobe', label: 'Wardrobe' },
	{ href: '/outfits', label: 'Outfits' },
	{ href: '/planner', label: 'Planner' },
	{ href: '/discover', label: 'Discover' },
	{ href: '/collections', label: 'Lookbooks' },
	{ href: '/insights', label: 'Insights' },
	{ href: '/settings', label: 'Settings' },
];

export const wardrobeItems: WardrobeItem[] = [
	{
		id: 'camel-blazer',
		name: 'Camel wool blazer',
		type: 'Outerwear',
		subcategory: 'Blazer',
		color: 'Camel',
		season: 'Fall',
		occasion: 'Work',
		brand: 'Atelier Row',
		notes: 'Structured, warm neutral, pairs with cream and black.',
		wears: 14,
		lastWorn: 'Jun 08',
		status: 'favorite',
		tone: 'sand',
		shape: 'jacket',
	},
	{
		id: 'ivory-knit',
		name: 'Ivory ribbed knit',
		type: 'Top',
		subcategory: 'Sweater',
		color: 'Ivory',
		season: 'All season',
		occasion: 'Everyday',
		brand: 'Northline',
		notes: 'Soft layer for capsule looks.',
		wears: 23,
		lastWorn: 'Jun 10',
		status: 'ready',
		tone: 'cream',
		shape: 'top',
	},
	{
		id: 'sage-overshirt',
		name: 'Sage utility overshirt',
		type: 'Outerwear',
		subcategory: 'Overshirt',
		color: 'Sage',
		season: 'Spring',
		occasion: 'Travel',
		brand: 'Field Day',
		notes: 'Easy airport layer, wrinkle tolerant.',
		wears: 5,
		lastWorn: 'May 26',
		status: 'underused',
		tone: 'sage',
		shape: 'jacket',
	},
	{
		id: 'black-column-dress',
		name: 'Black column dress',
		type: 'Dress',
		subcategory: 'Midi',
		color: 'Black',
		season: 'All season',
		occasion: 'Dinner',
		brand: 'Line Studio',
		notes: 'Works with blazer, scarf, or silver jewelry.',
		wears: 9,
		lastWorn: 'Jun 01',
		status: 'ready',
		tone: 'ink',
		shape: 'dress',
	},
	{
		id: 'berry-cardigan',
		name: 'Berry merino cardigan',
		type: 'Top',
		subcategory: 'Cardigan',
		color: 'Berry',
		season: 'Fall',
		occasion: 'Weekend',
		brand: 'Maison Lark',
		notes: 'Accent piece. Keep in rotation with denim and cream.',
		wears: 3,
		lastWorn: 'Apr 18',
		status: 'review',
		tone: 'berry',
		shape: 'top',
	},
	{
		id: 'cream-wide-leg',
		name: 'Cream wide-leg trouser',
		type: 'Bottom',
		subcategory: 'Trouser',
		color: 'Cream',
		season: 'Summer',
		occasion: 'Work',
		brand: 'Foundry',
		notes: 'High waist, best with cropped layers.',
		wears: 16,
		lastWorn: 'Jun 09',
		status: 'ready',
		tone: 'cream',
		shape: 'trouser',
	},
	{
		id: 'pleated-sand-skirt',
		name: 'Pleated sand skirt',
		type: 'Bottom',
		subcategory: 'Skirt',
		color: 'Sand',
		season: 'Spring',
		occasion: 'Brunch',
		brand: 'Still House',
		notes: 'Moves well, dress up with black tank.',
		wears: 7,
		lastWorn: 'May 30',
		status: 'ready',
		tone: 'sand',
		shape: 'skirt',
	},
	{
		id: 'black-loafer',
		name: 'Black leather loafer',
		type: 'Shoes',
		subcategory: 'Loafer',
		color: 'Black',
		season: 'All season',
		occasion: 'Work',
		brand: 'Cobbler Lane',
		notes: 'Most reliable office shoe.',
		wears: 31,
		lastWorn: 'Jun 11',
		status: 'favorite',
		tone: 'ink',
		shape: 'shoe',
	},
	{
		id: 'structured-tote',
		name: 'Structured cocoa tote',
		type: 'Accessory',
		subcategory: 'Bag',
		color: 'Cocoa',
		season: 'All season',
		occasion: 'Work',
		brand: 'Arc Supply',
		notes: 'Fits laptop, pairs with camel and ivory.',
		wears: 19,
		lastWorn: 'Jun 11',
		status: 'ready',
		tone: 'stone',
		shape: 'bag',
	},
];

export const outfits: Outfit[] = [
	{
		id: 'work-soft-tailoring',
		name: 'Soft tailoring for studio review',
		occasion: 'Work',
		weather: '26 C, light wind',
		items: ['camel-blazer', 'ivory-knit', 'cream-wide-leg', 'black-loafer', 'structured-tote'],
		reason: 'Uses a favorite blazer and keeps the palette warm for a long meeting day.',
		status: 'planned',
	},
	{
		id: 'date-night-column',
		name: 'Column dress with warm texture',
		occasion: 'Dinner',
		weather: '24 C, clear',
		items: ['black-column-dress', 'camel-blazer', 'black-loafer'],
		reason: 'Balances a clean black base with one structured warm layer.',
		status: 'draft',
	},
	{
		id: 'travel-sage-capsule',
		name: 'Sage travel capsule',
		occasion: 'Travel',
		weather: '22 C, airport layers',
		items: ['sage-overshirt', 'ivory-knit', 'cream-wide-leg', 'structured-tote'],
		reason: 'Rotates an underused overshirt into a comfortable airport outfit.',
		status: 'draft',
	},
];

export const events: EventPlan[] = [
	{
		id: 'friday-review',
		date: 'Jun 14',
		title: 'Studio client review',
		dressCode: 'Polished casual',
		weather: '26 C',
		outfit: 'Soft tailoring for studio review',
		status: 'planned',
	},
	{
		id: 'saturday-dinner',
		date: 'Jun 15',
		title: 'Anniversary dinner',
		dressCode: 'Evening',
		weather: '24 C',
		outfit: 'Column dress with warm texture',
		status: 'alternate-ready',
	},
	{
		id: 'monday-flight',
		date: 'Jun 17',
		title: 'Early flight to Seoul',
		dressCode: 'Travel',
		weather: '22 C',
		outfit: 'Needs outfit',
		status: 'needs-outfit',
	},
];

export const suggestions = [
	{
		title: 'Rotate the sage overshirt.',
		reason: 'Underused for 17 days and useful for travel weather.',
		tag: 'Closet health',
	},
	{
		title: 'Save a dinner alternate.',
		reason: 'The black dress has two reliable layer options.',
		tag: 'Event prep',
	},
	{
		title: 'Build a five-piece work capsule.',
		reason: 'Your most repeated searches are neutral work outfits.',
		tag: 'Capsule',
	},
];

export const insights = [
	{ label: 'Items digitized', value: '86', detail: '74% fully tagged' },
	{ label: 'Outfits saved', value: '24', detail: '9 planned ahead' },
	{ label: 'Cost per wear', value: '$3.80', detail: 'down 18% this month' },
	{ label: 'Underused pieces', value: '11', detail: '4 good declutter candidates' },
];

export const filterGroups = [
	['All', 'Work', 'Dinner', 'Travel', 'Weekend'],
	['All', 'Camel', 'Ivory', 'Sage', 'Black', 'Berry'],
	['All', 'Underused', 'Favorites', 'Needs review'],
];
