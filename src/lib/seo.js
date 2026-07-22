export async function getSEOMetadata(slug) {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://s1.pilotprograme.com/api';
    
    try {
        const res = await fetch(`${API_URL}/seo/page/${slug}`, {
            next: { revalidate: 60 } // Revalidate cache every 60 seconds
        });
        const data = await res.json();
        
        if (data.success && data.page) {
            const page = data.page;
            const title = page.title || `${slug.charAt(0).toUpperCase() + slug.slice(1)} — Pilot Programme`;
            const description = page.description || 'Pilot Programme — AI-Powered Faceless YouTube Automation';
            const canonicalUrl = page.og_url || `https://pilotprograme.com/${slug === 'home' ? '' : slug}`;
            
            return {
                title: title,
                description: description,
                keywords: page.keywords || '',
                robots: page.robots || 'index, follow',
                openGraph: {
                    title: page.og_title || title,
                    description: page.og_description || description,
                    type: page.og_type || 'website',
                    url: canonicalUrl,
                    siteName: 'Pilot Programme',
                    images: [
                        {
                            url: 'https://pilotprograme.com/pilotprograme-logo.jpg',
                            width: 1200,
                            height: 630,
                            alt: title,
                        }
                    ]
                },
                twitter: {
                    card: page.twitter_card || 'summary_large_image',
                    title: page.twitter_title || title,
                    description: page.twitter_description || description,
                    images: ['https://pilotprograme.com/pilotprograme-logo.jpg'],
                },
                alternates: {
                    canonical: canonicalUrl,
                }
            };
        }
    } catch (err) {
        console.error(`Error fetching SEO metadata for ${slug}:`, err);
    }

    // Default clean slug title if API is unreachable or slug not configured
    const cleanTitle = slug === 'home' 
        ? 'Pilot Programme — AI-Powered Faceless YouTube Automation'
        : `${slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ')} — Pilot Programme`;

    return {
        title: cleanTitle,
        description: 'Pilot Programme — AI-Powered Faceless YouTube Automation Platform.',
        robots: 'index, follow',
    };
}
