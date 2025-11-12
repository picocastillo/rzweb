// src/components/DarkModeToggleItem.tsx 

import React, { useState, useEffect, JSX } from 'react';
import { SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { Moon, Sun } from 'lucide-react'; 

/**
 * Componente único que gestiona la alternancia del modo oscuro (lógica y UI)
 * y se integra como un elemento de menú en la Sidebar.
 */
export function DarkModeToggleItem(): JSX.Element {
    // 1. Lógica de Inicialización y Estado
    const [isDarkMode, setDarkMode] = useState<boolean>(() => {
        // Inicialización perezosa para determinar el estado inicial.
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme === 'dark') {
            return true;
        }
        if (savedTheme === 'light') {
            return false;
        }
        return prefersDark; // preferencia del sistema si no hay nada guardado.
    });

    // Logica de Efecto Secundario (manejo de la clase 'dark' y localStorage)
    useEffect(() => {
        const root = document.documentElement;

        if (isDarkMode) {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    // Funcion para alternar el modo
    const toggleDarkMode = () => {
        setDarkMode(prevMode => !prevMode);
    };

    // Logica de Renderizado
    const Icon = isDarkMode ? Sun : Moon;
    const title = isDarkMode ? 'Modo Claro' : 'Modo Oscuro';

    return (
        <SidebarMenuItem>
            <SidebarMenuButton 
                onClick={toggleDarkMode}
                aria-label={`Cambiar a ${title}`}
            >
                {/* Ícono */}
                <Icon className="h-5 w-5" />
                
                {/* Texto */}
                <span>{title}</span>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}