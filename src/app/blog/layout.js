import { getSEOMetadata } from '@/lib/seo';

export async function generateMetadata() {
    return await getSEOMetadata('blog');
}

export default function BlogLayout({ children }) {
    return children;
}
