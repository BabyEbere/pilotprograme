export const metadata = {
    title: 'Blog — Pilot Programme | Faceless YouTube Automation Tips & Guides',
    description: 'Read the latest tips, guides, and insights on faceless YouTube automation, AI content creation, and growing your channel from the Pilot Programme blog.',
    keywords: 'Pilot Programme blog, faceless YouTube tips, AI content creation guides, YouTube automation blog, faceless YouTube strategy',
    openGraph: {
        title: 'Blog — Pilot Programme | Faceless YouTube Automation',
        description: 'Tips and guides on faceless YouTube automation and AI content creation.',
        url: 'https://pilotprograme.com/blog',
        type: 'website',
        siteName: 'Pilot Programme',
        images: [
            {
                url: 'https://pilotprograme.com/pilotprograme-logo.jpg',
                width: 1200,
                height: 630,
                alt: 'Pilot Programme Blog',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Blog — Pilot Programme | Faceless YouTube Automation',
        description: 'Tips and guides on faceless YouTube automation and AI content creation.',
        images: ['https://pilotprograme.com/pilotprograme-logo.jpg'],
    },
    alternates: {
        canonical: 'https://pilotprograme.com/blog',
    },
    robots: 'index, follow',
};

export default function BlogLayout({ children }) {
    return children;
}
