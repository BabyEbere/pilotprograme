import { getSEOMetadata } from '@/lib/seo';

export async function generateMetadata() {
    return await getSEOMetadata('privacy');
}

export default function PrivacyLayout({ children }) {
    return children;
}
