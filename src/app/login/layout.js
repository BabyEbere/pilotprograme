import { getSEOMetadata } from '@/lib/seo';

export async function generateMetadata() {
    return await getSEOMetadata('login');
}

export default function LoginLayout({ children }) {
    return children;
}
