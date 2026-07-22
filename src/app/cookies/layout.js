import { getSEOMetadata } from '@/lib/seo';

export async function generateMetadata() {
    return await getSEOMetadata('cookies');
}

export default function CookiesLayout({ children }) {
    return children;
}
