import { getSEOMetadata } from '@/lib/seo';

export async function generateMetadata() {
    return await getSEOMetadata('terms');
}

export default function TermsLayout({ children }) {
    return children;
}
