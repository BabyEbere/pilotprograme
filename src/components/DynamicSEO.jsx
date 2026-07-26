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
            // Set page title to Admin defined title
            if (seoData.title) {
                document.title = seoData.title;
            } else if (fallbackTitle) {
                document.title = fallbackTitle;
            }
            
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
            // Remove existing JSON-LD schema scripts
            const existingSchema = document.getElementById('json-ld-schema');
            if (existingSchema) existingSchema.remove();
            const existingBreadcrumbs = document.getElementById('json-ld-breadcrumbs');
            if (existingBreadcrumbs) existingBreadcrumbs.remove();
            const existingFAQ = document.getElementById('json-ld-faq');
            if (existingFAQ) existingFAQ.remove();
            const existingNavSchema = document.getElementById('json-ld-navigation');
            if (existingNavSchema) existingNavSchema.remove();

            const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.pilotprograme.com';
            
            // 0. SiteNavigationElement Schema (Tells Google Search about all navbar links for Sitelinks indexing)
            const navigationSchema = {
                '@context': 'https://schema.org',
                '@type': 'ItemList',
                'name': 'Pilot Programme Site Navigation',
                'itemListElement': [
                    { '@type': 'SiteNavigationElement', 'position': 1, 'name': 'Home', 'description': 'Main overview', 'url': `${origin}/` },
                    { '@type': 'SiteNavigationElement', 'position': 2, 'name': 'YouTube Script Engine', 'description': 'Generate faceless scripts with AI Gemini 2.5', 'url': `${origin}/features` },
                    { '@type': 'SiteNavigationElement', 'position': 3, 'name': 'Blog to Script Converter', 'description': 'Convert webpage URLs to video scripts', 'url': `${origin}/features` },
                    { '@type': 'SiteNavigationElement', 'position': 4, 'name': 'Story to Screenplay Lab', 'description': 'Film outline & screenplay generator', 'url': `${origin}/features` },
                    { '@type': 'SiteNavigationElement', 'position': 5, 'name': 'Video Tutorials', 'description': 'Step-by-step video guides', 'url': `${origin}/tutorial` },
                    { '@type': 'SiteNavigationElement', 'position': 6, 'name': 'Documentation', 'description': 'Platform documentation and guides', 'url': `${origin}/documentation` },
                    { '@type': 'SiteNavigationElement', 'position': 7, 'name': 'Blog & Strategy Guides', 'description': 'YouTube automation articles', 'url': `${origin}/blog` },
                    { '@type': 'SiteNavigationElement', 'position': 8, 'name': 'Pricing Plans', 'description': 'Transparent pricing and subscription tiers', 'url': `${origin}/pricing` },
                    { '@type': 'SiteNavigationElement', 'position': 9, 'name': 'About Us', 'description': 'About Pilot Programme platform', 'url': `${origin}/about` },
                    { '@type': 'SiteNavigationElement', 'position': 10, 'name': 'Contact Us', 'description': 'Contact Pilot Programme support and inquiries', 'url': `${origin}/contact` },
                    { '@type': 'SiteNavigationElement', 'position': 11, 'name': 'Affiliate Program', 'description': 'Earn commissions referring creators', 'url': `${origin}/affiliate` }
                ]
            };

            const navScript = document.createElement('script');
            navScript.id = 'json-ld-navigation';
            navScript.type = 'application/ld+json';
            navScript.text = JSON.stringify(navigationSchema);
            document.head.appendChild(navScript);

            // 1. Breadcrumbs Schema (consists of home, register, login, about, features, pricing, documentation)
            const breadcrumbSchema = {
                '@context': 'https://schema.org',
                '@type': 'BreadcrumbList',
                'itemListElement': [
                    { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': `${origin}/` },
                    { '@type': 'ListItem', 'position': 2, 'name': 'Features', 'item': `${origin}/features` },
                    { '@type': 'ListItem', 'position': 3, 'name': 'Pricing', 'item': `${origin}/pricing` },
                    { '@type': 'ListItem', 'position': 4, 'name': 'About', 'item': `${origin}/about` },
                    { '@type': 'ListItem', 'position': 5, 'name': 'Documentation', 'item': `${origin}/tutorial` },
                    { '@type': 'ListItem', 'position': 6, 'name': 'Login', 'item': `${origin}/login` },
                    { '@type': 'ListItem', 'position': 7, 'name': 'Register', 'item': `${origin}/register` }
                ]
            };

            const breadcrumbScript = document.createElement('script');
            breadcrumbScript.id = 'json-ld-breadcrumbs';
            breadcrumbScript.type = 'application/ld+json';
            breadcrumbScript.text = JSON.stringify(breadcrumbSchema);
            document.head.appendChild(breadcrumbScript);

            // 2. Primary Page Schema (WebSite, Organization, Article, Product, Dataset)
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
                        'target': `${origin}/?search={search_term_string}`,
                        'query-input': 'required name=search_term_string'
                    }
                };
            } else if (schemaType === 'Organization') {
                schema = {
                    '@context': 'https://schema.org',
                    '@type': 'Organization',
                    'name': seoData.title || fallbackTitle || 'Pilot Programme',
                    'url': seoData.og_url || window.location.href,
                    'logo': `${origin}/pilotprograme-logo.jpg`,
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
                            'url': `${origin}/pilotprograme-logo.jpg`
                        }
                    }
                };
            } else if (schemaType === 'Product') {
                schema = {
                    '@context': 'https://schema.org',
                    '@type': 'Product',
                    'name': seoData.title || fallbackTitle || 'Pilot Programme — Faceless YouTube Automation Suite',
                    'image': `${origin}/pilotprograme-logo.jpg`,
                    'description': seoData.description || fallbackDescription || 'AI Faceless YouTube automation platform with script generation, voiceovers, scene images, and channel analytics.',
                    'brand': {
                        '@type': 'Brand',
                        'name': 'Pilot Programme'
                    },
                    'offers': {
                        '@type': 'AggregateOffer',
                        'priceCurrency': 'NGN',
                        'lowPrice': '0',
                        'highPrice': '9000',
                        'offerCount': '4',
                        'offers': [
                            {
                                '@type': 'Offer',
                                'name': 'Free Plan',
                                'price': '0',
                                'priceCurrency': 'NGN',
                                'availability': 'https://schema.org/InStock',
                                'url': `${origin}/pricing`
                            },
                            {
                                '@type': 'Offer',
                                'name': 'Starter Plan',
                                'price': '2500',
                                'priceCurrency': 'NGN',
                                'availability': 'https://schema.org/InStock',
                                'url': `${origin}/pricing`
                            },
                            {
                                '@type': 'Offer',
                                'name': 'Pookie Plan',
                                'price': '5000',
                                'priceCurrency': 'NGN',
                                'availability': 'https://schema.org/InStock',
                                'url': `${origin}/pricing`
                            },
                            {
                                '@type': 'Offer',
                                'name': 'Creator Plan',
                                'price': '9000',
                                'priceCurrency': 'NGN',
                                'availability': 'https://schema.org/InStock',
                                'url': `${origin}/pricing`
                            }
                        ]
                    }
                };
            } else if (schemaType === 'Dataset') {
                schema = {
                    '@context': 'https://schema.org',
                    '@type': 'Dataset',
                    'name': seoData.title || fallbackTitle || 'Pilot Programme Faceless YouTube Automation & AI Prompt Dataset',
                    'description': seoData.description || fallbackDescription || 'Comprehensive dataset of AI video scripts, niche automation frameworks, voice synthesis presets, and YouTube metadata analytics.',
                    'url': `${origin}/blog`,
                    'keywords': ['AI video scripts', 'YouTube automation dataset', 'faceless YouTube channels', 'AI voiceover presets'],
                    'creator': {
                        '@type': 'Organization',
                        'name': 'Pilot Programme'
                    },
                    'license': 'https://creativecommons.org/licenses/by/4.0/'
                };
            }
            
            // Merge with custom schema data if provided
            if (customSchemaData && Object.keys(customSchemaData).length > 0) {
                schema = { ...schema, ...customSchemaData };
            }
            
            // Add Primary JSON-LD script to head
            const script = document.createElement('script');
            script.id = 'json-ld-schema';
            script.type = 'application/ld+json';
            script.text = JSON.stringify(schema);
            document.head.appendChild(script);

            // 3. Add FAQPage schema if FAQ data is provided or page contains FAQs
            const activeFaqs = faqData && faqData.length > 0 ? faqData : [
                {
                    q: 'How does faceless YouTube automation work?',
                    a: 'Faceless YouTube automation uses AI to write video scripts, generate realistic voiceover narration, and render scene images without requiring a camera or video editor.'
                },
                {
                    q: 'Can I generate scene prompts and visual bibles with Gemini AI?',
                    a: 'Yes! Pilot Programme uses Google Gemini AI to analyze script scenes, extract visual prompts, and maintain character face and environment consistency across scenes.'
                },
                {
                    q: 'What subscription plans are available for Pilot Programme?',
                    a: 'We offer Free, Starter (₦2,500/mo), Pookie (₦5,000/mo), and Creator (₦9,000/mo) plans with instant Paystack activation and flexible credit quotas.'
                },
                {
                    q: 'Are the AI voiceovers and generated scripts monetizable on YouTube?',
                    a: 'Yes! All scripts, voiceovers, and scene images generated on Pilot Programme comply with YouTube monetization guidelines.'
                }
            ];

            const faqSchema = {
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                'mainEntity': activeFaqs.map(faq => ({
                    '@type': 'Question',
                    'name': faq.q || faq.question,
                    'acceptedAnswer': {
                        '@type': 'Answer',
                        'text': faq.a || faq.answer
                    }
                }))
            };

            const faqScript = document.createElement('script');
            faqScript.id = 'json-ld-faq';
            faqScript.type = 'application/ld+json';
            faqScript.text = JSON.stringify(faqSchema);
            document.head.appendChild(faqScript);
        };

        const applyFallbackSEO = () => {
            if (fallbackTitle) {
                document.title = fallbackTitle;
            }
            
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
