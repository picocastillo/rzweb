import React from 'react';

export default function AppLogoIcon(props: React.ComponentPropsWithoutRef<'img'>) {
    return (
        <img
            // Fuente de la imagen en la carpeta public
            src="/logo_naranja.png"
            
            // Texto alternativo por accesibilidad (¡muy importante!)
            alt="Logo de la aplicación en color naranja"
            
            // Esparce todos los props recibidos (como className, width, etc.)
            {...props}
        />
    );
}
