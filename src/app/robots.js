export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/control/'], // Do not index authenticated dashboards
    },
    sitemap: 'https://pilotprograme.com/sitemap.xml',
  };
}
