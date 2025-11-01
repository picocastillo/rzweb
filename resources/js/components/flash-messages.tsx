// resources/js/components/FlashMessages.tsx

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { usePage } from '@inertiajs/react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

type Flash = {
    success?: string;
    error?: string;
};

export default function FlashMessages() {
    const { flash } = usePage<{ flash: Flash }>().props;
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (flash.success || flash.error) {
            setVisible(true);
            const timer = setTimeout(() => {
                setVisible(false);
            }, 5000); // Ocultar después de 5 segundos

            return () => clearTimeout(timer);
        }
    }, [flash]);

    if (!visible || (!flash.success && !flash.error)) {
        return null;
    }

    return (
        <div className="fixed top-4 left-1/2 z-50 w-full max-w-md -translate-x-1/2 animate-in slide-in-from-top-5">
            {flash.success && (
                <Alert variant="default" className="border-green-500 bg-green-50 dark:bg-green-950">
                    <CheckCircle2 className="text-green-600 dark:text-green-400" />
                    <AlertTitle className="text-green-800 dark:text-green-200">
                        ¡Éxito!
                    </AlertTitle>
                    <AlertDescription className="text-green-700 dark:text-green-300">
                        {flash.success}
                    </AlertDescription>
                </Alert>
            )}

            {flash.error && (
                <Alert variant="destructive">
                    <XCircle />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{flash.error}</AlertDescription>
                </Alert>
            )}
        </div>
    );
}