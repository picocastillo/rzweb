import React from 'react';

export default function AppLoginLogoIcon(props: React.ComponentPropsWithoutRef<'img'>) {
    return (
        <img
            // Fuente de la imagen en la carpeta public
            src="/logo_horizontal.png"
            
            // Texto alternativo por accesibilidad (¡muy importante!)
            alt="Logo de la aplicación"
            
            // Esparce todos los props recibidos (como className, width, etc.)
            {...props}
        />
    );
}
