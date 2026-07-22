import { getSEOMetadata } from '@/lib/seo';

export async function generateMetadata() {
    return await getSEOMetadata('documentation');
}

export default function DocumentationLayout({ children }) {
    return children;
}
