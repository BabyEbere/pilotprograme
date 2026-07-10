"use client";

import { useState, useRef, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function DarkModeToggle() {
    const { theme, toggleTheme } = useTheme();
    const [position, setPosition] = useState({ x: window.innerWidth - 80, y: window.innerHeight - 80 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const buttonRef = useRef(null);

    const handleMouseDown = (e) => {
        e.preventDefault();
        setIsDragging(true);
        const rect = buttonRef.current.getBoundingClientRect();
        setDragStart({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;

        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;

        setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
        if (!isDragging) return;
        setIsDragging(false);

        // Snap to nearest edge
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const buttonSize = 64;
        const margin = 24;

        let finalX = position.x;
        let finalY = position.y;

        // Calculate distances to each edge
        const distanceToLeft = position.x;
        const distanceToRight = windowWidth - position.x - buttonSize;
        const distanceToTop = position.y;
        const distanceToBottom = windowHeight - position.y - buttonSize;

        const minDistance = Math.min(distanceToLeft, distanceToRight, distanceToTop, distanceToBottom);

        // Snap to the closest edge
        if (minDistance === distanceToLeft) {
            finalX = margin;
        } else if (minDistance === distanceToRight) {
            finalX = windowWidth - buttonSize - margin;
        }

        if (minDistance === distanceToTop) {
            finalY = margin;
        } else if (minDistance === distanceToBottom) {
            finalY = windowHeight - buttonSize - margin;
        }

        // Ensure button stays within bounds
        finalX = Math.max(margin, Math.min(finalX, windowWidth - buttonSize - margin));
        finalY = Math.max(margin, Math.min(finalY, windowHeight - buttonSize - margin));

        setPosition({ x: finalX, y: finalY });
    };

    const handleClick = (e) => {
        // Only toggle if we didn't drag
        if (!isDragging) {
            e.stopPropagation();
            toggleTheme();
        }
    };

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);

            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, dragStart, position]);

    // Update position on window resize
    useEffect(() => {
        const handleResize = () => {
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;
            const buttonSize = 64;
            const margin = 24;

            setPosition(prev => ({
                x: Math.min(prev.x, windowWidth - buttonSize - margin),
                y: Math.min(prev.y, windowHeight - buttonSize - margin),
            }));
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <button
            ref={buttonRef}
            onMouseDown={handleMouseDown}
            onClick={handleClick}
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                cursor: isDragging ? 'grabbing' : 'grab',
                transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            className="fixed z-50 p-4 rounded-full bg-white dark:bg-gray-800 shadow-2xl hover:shadow-red-500/20 dark:hover:shadow-red-500/40 hover:scale-110 border-2 border-gray-200 dark:border-gray-700 transition-colors duration-300"
            aria-label="Toggle dark mode"
        >
            {theme === 'dark' ? (
                <Sun className="w-6 h-6 text-yellow-500 pointer-events-none transition-transform duration-300" />
            ) : (
                <Moon className="w-6 h-6 text-gray-700 dark:text-gray-300 pointer-events-none transition-transform duration-300" />
            )}
        </button>
    );
}
