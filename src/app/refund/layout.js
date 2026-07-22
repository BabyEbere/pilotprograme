import { getSEOMetadata } from '@/lib/seo';

export async function generateMetadata() {
    return await getSEOMetadata('refund');
}

export default function RefundLayout({ children }) {
    return children;
}
