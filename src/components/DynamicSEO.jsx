"use client";

import { useEffect, useState } from 'react';

export default function DynamicSEO({ pageSlug, fallbackTitle, fallbackDescription, fallbackKeywords, schemaType = 'WebSite', schemaData = {}, faqData = [] }) {
    useEffect(() => {
        const fetchSEOSettings = async () => {
            try {
                const API_URL = (typeof window !== 'undefined' 
                    ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
                        ? 'http://localhost:5000' 
                        : 'https://s1.pilotprograme.com/api') 
                    : 'http://localhost:5000');
                
                const res = await fetch(`${API_URL}/seo/page/${pageSlug}`);
                const data = await res.json();
                
                if (data.success && data.page) {
                    applySEOSettings(data.page);
                } else {
                    // Apply fallback values if no settings found
                    applyFallbackSEO();
                }
            } catch (err) {
                console.error('Error fetching SEO settings:', err);
                applyFallbackSEO();
            }
        };

        const applySEOSettings = (seoData) => {
            // Set page title
            document.title = seoData.title || fallbackTitle || 'Pilot Programme';
            
            // Set or update meta description
            let desc = document.querySelector('meta[name="description"]');
            if (!desc) { 
                desc = document.createElement('meta'); 
                desc.name = 'description'; 
                document.head.appendChild(desc); 
            }
            desc.content = seoData.description || fallbackDescription || '';
            
            // Set keywords
            let keywords = document.querySelector('meta[name="keywords"]');
            if (!keywords) { 
                keywords = document.createElement('meta'); 
                keywords.name = 'keywords'; 
                document.head.appendChild(keywords); 
            }
            keywords.content = seoData.keywords || fallbackKeywords || '';
            
            // Set robots
            let robots = document.querySelector('meta[name="robots"]');
            if (!robots) { 
                robots = document.createElement('meta'); 
                robots.name = 'robots'; 
                document.head.appendChild(robots); 
            }
            robots.content = seoData.robots || 'index, follow';
            
            // Open Graph tags
            const ogTags = [
                { property: 'og:title', content: seoData.og_title || seoData.title },
                { property: 'og:description', content: seoData.og_description || seoData.description },
                { property: 'og:type', content: seoData.og_type || 'website' },
                { property: 'og:url', content: seoData.og_url || window.location.href },
            ];
            
            ogTags.forEach(tag => {
                const key = 'property';
                const val = tag.property;
                let el = document.querySelector(`meta[${key}="${val}"]`);
                if (!el) { 
                    el = document.createElement('meta'); 
                    el.setAttribute(key, val); 
                    document.head.appendChild(el); 
                }
                el.content = tag.content;
            });
            
            // Twitter Card tags
            const twitterTags = [
                { name: 'twitter:card', content: seoData.twitter_card || 'summary_large_image' },
                { name: 'twitter:title', content: seoData.twitter_title || seoData.title },
                { name: 'twitter:description', content: seoData.twitter_description || seoData.description },
            ];
            
            twitterTags.forEach(tag => {
                const key = 'name';
                const val = tag.name;
                let el = document.querySelector(`meta[${key}="${val}"]`);
                if (!el) { 
                    el = document.createElement('meta'); 
                    el.setAttribute(key, val); 
                    document.head.appendChild(el); 
                }
                el.content = tag.content;
            });
            
            // Custom head script
            if (seoData.custom_head_script) {
                // Remove existing custom script if any
                const existingScript = document.getElementById('custom-seo-script');
                if (existingScript) {
                    existingScript.remove();
                }
                
                // Add new custom script
                const scriptContainer = document.createElement('div');
                scriptContainer.id = 'custom-seo-script';
                scriptContainer.innerHTML = seoData.custom_head_script;
                document.head.appendChild(scriptContainer);
            }
            
            // Set breadcrumb title in localStorage for components to use
            if (seoData.breadcrumb_title) {
                localStorage.setItem(`breadcrumb_${pageSlug}`, seoData.breadcrumb_title);
            }
            
            // Add JSON-LD structured data
            addJSONLDSchema(seoData, schemaType, schemaData, faqData);
        };

        const addJSONLDSchema = (seoData, schemaType, customSchemaData, faqData) => {
            // Remove existing JSON-LD schema if any
            const existingSchema = document.getElementById('json-ld-schema');
            if (existingSchema) {
                existingSchema.remove();
            }
            
            // Build schema object
            let schema = {};
            
            if (schemaType === 'WebSite') {
                schema = {
                    '@context': 'https://schema.org',
                    '@type': 'WebSite',
                    'name': seoData.title || fallbackTitle || 'Pilot Programme',
                    'url': seoData.og_url || window.location.href,
                    'description': seoData.description || fallbackDescription || '',
                    'potentialAction': {
                        '@type': 'SearchAction',
                        'target': `${window.location.origin}/?search={search_term_string}`,
                        'query-input': 'required name=search_term_string'
                    }
                };
            } else if (schemaType === 'Organization') {
                schema = {
                    '@context': 'https://schema.org',
                    '@type': 'Organization',
                    'name': seoData.title || fallbackTitle || 'Pilot Programme',
                    'url': seoData.og_url || window.location.href,
                    'logo': 'https://pilotprograme.com/pilotprograme-logo.jpg',
                    'description': seoData.description || fallbackDescription || '',
                    'sameAs': [
                        'https://twitter.com/pilotprograme',
                        'https://youtube.com/@pilotprograme'
                    ]
                };
            } else if (schemaType === 'Article') {
                schema = {
                    '@context': 'https://schema.org',
                    '@type': 'Article',
                    'headline': seoData.title || fallbackTitle,
                    'description': seoData.description || fallbackDescription,
                    'url': seoData.og_url || window.location.href,
                    'datePublished': new Date().toISOString(),
                    'author': {
                        '@type': 'Organization',
                        'name': 'Pilot Programme'
                    },
                    'publisher': {
                        '@type': 'Organization',
                        'name': 'Pilot Programme',
                        'logo': {
                            '@type': 'ImageObject',
                            'url': 'https://pilotprograme.com/pilotprograme-logo.jpg'
                        }
                    }
                };
            } else if (schemaType === 'Product') {
                schema = {
                    '@context': 'https://schema.org',
                    '@type': 'Product',
                    'name': seoData.title || fallbackTitle,
                    'description': seoData.description || fallbackDescription,
                    'url': seoData.og_url || window.location.href,
                    'offers': customSchemaData.offers || []
                };
            }
            
            // Add FAQPage schema if FAQ data is provided
            if (faqData && faqData.length > 0) {
                schema = {
                    '@context': 'https://schema.org',
                    '@type': 'FAQPage',
                    'mainEntity': faqData.map(faq => ({
                        '@type': 'Question',
                        'name': faq.q || faq.question,
                        'acceptedAnswer': {
                            '@type': 'Answer',
                            'text': faq.a || faq.answer
                        }
                    }))
                };
            }
            
            // Merge with custom schema data if provided
            if (customSchemaData && Object.keys(customSchemaData).length > 0) {
                schema = { ...schema, ...customSchemaData };
            }
            
            // Add JSON-LD script to head
            const script = document.createElement('script');
            script.id = 'json-ld-schema';
            script.type = 'application/ld+json';
            script.text = JSON.stringify(schema);
            document.head.appendChild(script);
        };

        const applyFallbackSEO = () => {
            document.title = fallbackTitle || 'Pilot Programme';
            
            let desc = document.querySelector('meta[name="description"]');
            if (!desc) { 
                desc = document.createElement('meta'); 
                desc.name = 'description'; 
                document.head.appendChild(desc); 
            }
            desc.content = fallbackDescription || '';
            
            if (fallbackKeywords) {
                let keywords = document.querySelector('meta[name="keywords"]');
                if (!keywords) { 
                    keywords = document.createElement('meta'); 
                    keywords.name = 'keywords'; 
                    document.head.appendChild(keywords); 
                }
                keywords.content = fallbackKeywords;
            }
        };

        fetchSEOSettings();
    }, [pageSlug, fallbackTitle, fallbackDescription, fallbackKeywords, schemaType, schemaData]);

    return null; // This component doesn't render anything
}

// Helper hook to get breadcrumb title
export function useBreadcrumbTitle(pageSlug) {
    const [breadcrumbTitle, setBreadcrumbTitle] = useState('');
    
    useEffect(() => {
        const stored = localStorage.getItem(`breadcrumb_${pageSlug}`);
        if (stored) {
            setBreadcrumbTitle(stored);
        }
    }, [pageSlug]);
    
    return breadcrumbTitle;
}
