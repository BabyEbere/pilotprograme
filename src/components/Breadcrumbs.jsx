"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Breadcrumbs() {
    const pathname = usePathname();
    const [breadcrumbs, setBreadcrumbs] = useState([]);

    useEffect(() => {
        // Generate breadcrumbs from pathname
        const pathSegments = pathname.split('/').filter(segment => segment);
        
        const breadcrumbItems = [
            { label: 'Home', href: '/' }
        ];

        // Build breadcrumb items
        let currentPath = '';
        pathSegments.forEach((segment, index) => {
            currentPath += `/${segment}`;
            
            // Get custom breadcrumb title from localStorage if available
            const customTitle = localStorage.getItem(`breadcrumb_${segment}`);
            const label = customTitle || formatBreadcrumbLabel(segment);
            
            breadcrumbItems.push({
                label,
                href: currentPath,
                isLast: index === pathSegments.length - 1
            });
        });

        setBreadcrumbs(breadcrumbItems);
    }, [pathname]);

    const formatBreadcrumbLabel = (segment) => {
        // Convert slug to readable format
        return segment
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    // Don't show breadcrumbs on home page
    if (pathname === '/') {
        return null;
    }

    return (
        <nav className="bg-gray-50 dark:bg-[#111111] border-b border-gray-200 dark:border-white/10 py-3">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <ol className="flex items-center space-x-2 text-sm">
                    {breadcrumbs.map((item, index) => (
                        <li key={item.href} className="flex items-center">
                            {index > 0 && (
                                <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
                            )}
                            {item.isLast ? (
                                <span className="text-gray-900 dark:text-white font-medium">
                                    {item.label}
                                </span>
                            ) : (
                                <Link
                                    href={item.href}
                                    className="flex items-center text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 transition-colors"
                                >
                                    {index === 0 && <Home className="w-4 h-4 mr-1" />}
                                    {item.label}
                                </Link>
                            )}
                        </li>
                    ))}
                </ol>
            </div>
        </nav>
    );
}
