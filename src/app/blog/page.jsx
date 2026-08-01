import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import BlogFilter from '@/components/BlogFilter';

const API_URL = 'https://s1.pilotprograme.com/api';

export const revalidate = 60; // Revalidate blog listing page every 60 seconds (ISR)

async function getBlogData() {
    let posts = [];
    let categories = [];

    try {
        const [postsRes, categoriesRes] = await Promise.all([
            fetch(`${API_URL}/blog/posts?status=published`, { next: { revalidate: 3600 } }),
            fetch(`${API_URL}/blog/categories`, { next: { revalidate: 3600 } })
        ]);

        if (postsRes.ok) {
            const postsData = await postsRes.json();
            if (postsData.success) {
                posts = (postsData.posts || []).map(post => {
                    const rawImage = post.featured_image || '';
                    let cleanImage = rawImage;
                    if (cleanImage.startsWith('data:')) {
                        cleanImage = '';
                    } else if (cleanImage) {
                        if (!cleanImage.startsWith('http://') && !cleanImage.startsWith('https://')) {
                            const slash = cleanImage.startsWith('/') ? '' : '/';
                            cleanImage = `https://s1.pilotprograme.com${slash}${cleanImage}`;
                        } else {
                            cleanImage = cleanImage.replace(/http:\/\/(localhost|127\.0\.0\.1):\d+/, 'https://s1.pilotprograme.com');
                        }
                    }
                    return {
                        ...post,
                        featured_image: cleanImage
                    };
                });
            }
        }

        if (categoriesRes.ok) {
            const categoriesData = await categoriesRes.json();
            if (categoriesData.success) {
                categories = categoriesData.categories || [];
            }
        }
    } catch (err) {
        console.error('Error fetching blog data on server:', err);
    }

    return { posts, categories };
}

export async function generateMetadata() {
    return {
        title: 'Blog — Pilot Programme | Faceless YouTube Automation Tips & Guides',
        description: 'Read the latest tips, guides, and insights on faceless YouTube automation, AI content creation, and growing your channel from the Pilot Programme blog.',
        keywords: 'Pilot Programme blog, faceless YouTube tips, AI content creation guides, YouTube automation blog, faceless YouTube strategy',
        openGraph: {
            title: 'Blog — Pilot Programme | Faceless YouTube Automation Tips & Guides',
            description: 'Read the latest tips, guides, and insights on faceless YouTube automation, AI content creation, and growing your channel.',
            url: 'https://pilotprograme.com/blog',
            type: 'website',
            siteName: 'Pilot Programme',
            images: [
                {
                    url: 'https://pilotprograme.com/pilotprograme-logo.jpg',
                    width: 1200,
                    height: 630,
                    alt: 'Pilot Programme Blog'
                }
            ]
        },
        twitter: {
            card: 'summary_large_image',
            title: 'Blog — Pilot Programme | Faceless YouTube Automation Tips & Guides',
            description: 'Read the latest tips, guides, and insights on faceless YouTube automation.',
            images: ['https://pilotprograme.com/pilotprograme-logo.jpg']
        }
    };
}

export default async function BlogPage() {
    const { posts, categories } = await getBlogData();

    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://pilotprograme.com/' },
            { '@type': 'ListItem', 'position': 2, 'name': 'Blog', 'item': 'https://pilotprograme.com/blog' }
        ]
    };

    const datasetSchema = {
        '@context': 'https://schema.org',
        '@type': 'Dataset',
        'name': 'Pilot Programme Faceless YouTube Automation & AI Prompt Dataset',
        'description': 'Comprehensive dataset of AI video scripts, niche automation frameworks, voice synthesis presets, and YouTube metadata analytics.',
        'url': 'https://pilotprograme.com/blog',
        'keywords': ['AI video scripts', 'YouTube automation dataset', 'faceless YouTube channels', 'AI voiceover presets'],
        'creator': {
            '@type': 'Organization',
            'name': 'Pilot Programme'
        },
        'license': 'https://creativecommons.org/licenses/by/4.0/'
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetSchema) }}
            />
            
            <Navbar />
            <Breadcrumbs />
            
            <div className="min-h-screen bg-white dark:bg-[#0a0a0a]">
                {/* Header */}
                <div className="bg-gradient-to-br from-red-600 to-red-700 py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Blog</h1>
                        <p className="text-red-100 text-lg max-w-2xl">
                            Expert tips, tutorials, and insights for faceless YouTube content creators
                        </p>
                    </div>
                </div>

                {/* Filterable Posts (Client Component handling interactivity only) */}
                <BlogFilter initialPosts={posts} categories={categories} />
            </div>
            
            <Footer />
        </>
    );
}
