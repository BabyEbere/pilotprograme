import { getSEOMetadata } from '@/lib/seo';

export async function generateMetadata() {
    return await getSEOMetadata('affiliate');
}

export default function AffiliateLayout({ children }) {
    return children;
}
