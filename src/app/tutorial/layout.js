import { getSEOMetadata } from '@/lib/seo';

export async function generateMetadata() {
    return await getSEOMetadata('tutorial');
}

export default function TutorialLayout({ children }) {
    return children;
}
