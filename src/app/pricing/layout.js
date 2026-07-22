import { getSEOMetadata } from '@/lib/seo';

export async function generateMetadata() {
    return await getSEOMetadata('pricing');
}

export default function PricingLayout({ children }) {
    return children;
}
