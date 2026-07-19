export default async function sitemap() {
  const baseUrl = 'https://pilotprograme.com';
  
  // Base public pages
  const routes = [
    '',
    '/features',
    '/pricing',
    '/affiliate',
    '/about',
    '/documentation',
    '/blog',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: route === '' ? 1.0 : 0.8,
  }));
  
  // Dynamic blog posts for SEO indexability
  try {
    const res = await fetch('https://s1.pilotprograme.com/api/blog/posts?status=published', {
      next: { revalidate: 3600 } // Cache sitemap fetches for 1 hour
    });
    const data = await res.json();
    if (data.success && data.posts) {
      const blogRoutes = data.posts.map((post) => {
        // Safe URL encoding for slugs (escapes spaces, ampersands, etc.)
        const safeSlug = (post.slug || '')
          .split('/')
          .map(segment => encodeURIComponent(segment))
          .join('/');
          
        return {
          url: `${baseUrl}/blog/${safeSlug}`,
          lastModified: new Date(post.updated_at || post.created_at),
          changeFrequency: 'weekly',
          priority: 0.6,
        };
      });
      return [...routes, ...blogRoutes];
    }
  } catch (e) {
    console.error("Sitemap dynamic blog fetch failed:", e);
  }
  
  return routes;
}
