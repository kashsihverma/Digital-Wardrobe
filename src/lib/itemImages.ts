import type { ImageMetadata } from 'astro';

import berryCardigan from '../assets/wardrobe/berry-cardigan.png';
import blackColumnDress from '../assets/wardrobe/black-column-dress.png';
import blackLoafer from '../assets/wardrobe/black-loafer.png';
import camelBlazer from '../assets/wardrobe/camel-blazer.png';
import creamWideLeg from '../assets/wardrobe/cream-wide-leg.png';
import ivoryKnit from '../assets/wardrobe/ivory-knit.png';
import pleatedSandSkirt from '../assets/wardrobe/pleated-sand-skirt.png';
import sageOvershirt from '../assets/wardrobe/sage-overshirt.png';
import structuredTote from '../assets/wardrobe/structured-tote.png';

export const itemImages: Record<string, ImageMetadata> = {
	'berry-cardigan': berryCardigan,
	'black-column-dress': blackColumnDress,
	'black-loafer': blackLoafer,
	'camel-blazer': camelBlazer,
	'cream-wide-leg': creamWideLeg,
	'ivory-knit': ivoryKnit,
	'pleated-sand-skirt': pleatedSandSkirt,
	'sage-overshirt': sageOvershirt,
	'structured-tote': structuredTote,
};
