import React, { useState, useRef } from 'react';
import type { User, SearchMode } from '../types.ts';
import { LogoutIcon } from './icons/LogoutIcon.tsx';
import ThemeToggle from './ThemeToggle.tsx';
import { GearIcon } from './icons/GearIcon.tsx';
import { PresentationChartLineIcon } from './icons/PresentationChartLineIcon.tsx';
import { CodeBracketIcon } from './icons/CodeBracketIcon.tsx';
import AnimatedLogo from './AnimatedLogo.tsx';
import ModeSwitcher from './ModeSwitcher.tsx'; 

interface HeaderProps {
    user: User;
    onSignOut: () => void;
    toggleTheme: () => void;
    theme: string;
    onSettingsClick: () => void;
    onAnalyticsClick: () => void;
    isDevMode: boolean;
    onDevSettingsClick: () => void;
    mode: SearchMode;
    onModeChange: (newMode: SearchMode) => void;
}

const Header: React.FC<HeaderProps> = ({
    user,
    onSignOut,
    toggleTheme,
    theme,
    onSettingsClick,
    onAnalyticsClick,
    isDevMode,
    onDevSettingsClick,
    mode,
    onModeChange
}) => {
    const [logoClicks, setLogoClicks] = useState(0);
    const [titleClicks, setTitleClicks] = useState(0);
    const lastClickTime = useRef(0);

    const handleLogoClick = () => {
        const currentTime = Date.now();
        if (currentTime - lastClickTime.current > 1000 || titleClicks > 0) {
            setLogoClicks(1);
            setTitleClicks(0);
        } else {
            setLogoClicks(prev => prev + 1);
        }
        lastClickTime.current = currentTime;
    };

    const handleTitleClick = () => {
        const currentTime = Date.now();
        if (logoClicks === 5) {
            if (currentTime - lastClickTime.current > 1000) {
                setLogoClicks(0);
                setTitleClicks(0);
            } else {
                const newTitleClicks = titleClicks + 1;
                setTitleClicks(newTitleClicks);
                if (newTitleClicks === 5) {
                    onDevSettingsClick();
                    setLogoClicks(0);
                    setTitleClicks(0);
                }
            }
        } else {
            setLogoClicks(0);
            setTitleClicks(0);
        }
        lastClickTime.current = currentTime;
    };

    return (
        <header className="flex-shrink-0 bg-white dark:bg-gray-800 shadow-md p-3 flex items-center justify-between z-20">
            <div className="flex items-center gap-3">
                <div onClick={handleLogoClick} className="cursor-pointer">
                    <AnimatedLogo className="w-10 h-10" />
                </div>
                <h1 onClick={handleTitleClick} className="hidden sm:block text-xl font-bold text-slate-800 dark:text-white cursor-pointer select-none">
                    Prospect Nexus AI
                </h1>
            </div>

            <div className="absolute left-1/2 -translate-x-1/2">
                 <ModeSwitcher currentMode={mode} onModeChange={onModeChange} />
            </div>

            <div className="flex items-center gap-2">
                <span className="hidden md:inline text-sm font-medium text-slate-600 dark:text-gray-300">
                    Hola, {user.name.split(' ')[0]}
                </span>
                
                {isDevMode && (
                    <button
                        onClick={onDevSettingsClick}
                        className="p-2 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                        title="Panel de Desarrollador"
                    >
                        <CodeBracketIcon className="w-6 h-6" />
                    </button>
                )}

                <button
                    onClick={onAnalyticsClick}
                    className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    title="Ver Analíticas"
                >
                    <PresentationChartLineIcon className="w-6 h-6 text-slate-600 dark:text-gray-300" />
                </button>
                
                <button
                    onClick={onSettingsClick}
                    className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    title="Ajustes"
                >
                    <GearIcon className="w-6 h-6 text-slate-600 dark:text-gray-300" />
                </button>
                <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
                <button
                    onClick={onSignOut}
                    className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    title="Cerrar Sesión"
                >
                    <LogoutIcon className="w-6 h-6 text-slate-600 dark:text-gray-300" />
                </button>
            </div>
        </header>
    );
};

export default Header;