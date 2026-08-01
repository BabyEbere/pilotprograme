const API_URL = 'https://s1.pilotprograme.com/api';

/**
 * Safely parse any date (MySQL string, HTTP date string, ISO string) into valid W3C ISO 8601 format required by Google Search Console
 */
function formatW3CDate(rawDate) {
    if (!rawDate) return new Date().toISOString();
    try {
        let safeStr = String(rawDate).trim();
        // Replace space with T for MySQL 'YYYY-MM-DD HH:mm:ss' format
        if (/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}/.test(safeStr)) {
            safeStr = safeStr.replace(' ', 'T') + 'Z';
        }
        const d = new Date(safeStr);
        if (!isNaN(d.getTime())) {
            return d.toISOString();
        }
    } catch {
        /* fallback below */
    }
    return new Date().toISOString();
}

export default async function sitemap() {
    const baseUrl = 'https://pilotprograme.com';
    const nowIso = new Date().toISOString();
    
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
        lastModified: nowIso,
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
                    lastModified: formatW3CDate(post.updated_at || post.created_at),
                    changeFrequency: 'weekly',
                    priority: 0.7,
                }));
            }
        }
    } catch (err) {
        console.error('Error generating dynamic blog sitemap:', err);
    }

    // Fetch all public author profiles dynamically
    let authorRoutes = [];
    try {
        const res = await fetch(`${API_URL}/blog/authors`, {
            next: { revalidate: 3600 }
        });
        if (res.ok) {
            const data = await res.json();
            if (data.success && Array.isArray(data.authors)) {
                authorRoutes = data.authors.map((author) => ({
                    url: `${baseUrl}/blog/authors/${encodeURIComponent(author.slug)}`,
                    lastModified: formatW3CDate(author.updated_at || author.created_at),
                    changeFrequency: 'weekly',
                    priority: 0.8,
                }));
            }
        }
    } catch (err) {
        console.error('Error generating dynamic author sitemap:', err);
    }

    return [...routes, ...blogRoutes, ...authorRoutes];
}
