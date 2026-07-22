import { getSEOMetadata } from '@/lib/seo';

export async function generateMetadata() {
    return await getSEOMetadata('features');
}

export default function FeaturesLayout({ children }) {
    return children;
}
