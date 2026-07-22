import { getSEOMetadata } from '@/lib/seo';

export async function generateMetadata() {
    return await getSEOMetadata('register');
}

export default function RegisterLayout({ children }) {
    return children;
}
