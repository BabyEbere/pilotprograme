const API_URL = 'https://s1.pilotprograme.com/api';

export default async function sitemap() {
    const baseUrl = 'https://pilotprograme.com';
    
    // Core static pages
    const routes = [
        '',
        '/blog',
        '/features',
        '/pricing',
        '/about',
        '/contact',
        '/tutorial',
        '/documentation',
        '/privacy',
        '/terms',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date().toISOString(),
        changeFrequency: route === '' || route === '/blog' ? 'daily' : 'weekly',
        priority: route === '' ? 1.0 : (route === '/blog' ? 0.9 : 0.8),
    }));

    // Fetch all published blog posts dynamically
    let blogRoutes = [];
    try {
        const res = await fetch(`${API_URL}/blog/posts?status=published`, {
            next: { revalidate: 3600 }
        });
        if (res.ok) {
            const data = await res.json();
            if (data.success && Array.isArray(data.posts)) {
                blogRoutes = data.posts.map((post) => ({
                    url: `${baseUrl}/blog/${encodeURIComponent(post.slug)}`,
                    lastModified: post.updated_at || post.created_at || new Date().toISOString(),
                    changeFrequency: 'weekly',
                    priority: 0.7,
                }));
            }
        }
    } catch (err) {
        console.error('Error generating dynamic blog sitemap:', err);
    }

    return [...routes, ...blogRoutes];
}
