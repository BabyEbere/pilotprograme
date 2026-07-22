import { getSEOMetadata } from '@/lib/seo';
import HomeClient from '@/components/HomeClient';

export async function generateMetadata() {
    return await getSEOMetadata('home');
}

export default function HomePage(props) {
    return <HomeClient {...props} />;
}
