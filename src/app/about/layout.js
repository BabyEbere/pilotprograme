import { getSEOMetadata } from '@/lib/seo';

export async function generateMetadata() {
    return await getSEOMetadata('about');
}

export default function AboutLayout({ children }) {
    return children;
}
