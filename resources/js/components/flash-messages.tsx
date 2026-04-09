// resources/js/components/FlashMessages.tsx

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { usePage } from '@inertiajs/react';
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

type Flash = {
    success?: string;
    error?: string;
    warning?: string;
};

export default function FlashMessages() {
    const { flash } = usePage<{ flash: Flash }>().props;
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (flash.success || flash.error || flash.warning) {
            setVisible(true);
            const timer = setTimeout(() => {
                setVisible(false);
            }, 5000); // Ocultar después de 5 segundos

            return () => clearTimeout(timer);
        }
    }, [flash]);

    if (!visible || (!flash.success && !flash.error && !flash.warning)) {
        return null;
    }

    return (
        <div className="fixed top-4 left-1/2 z-50 flex w-full max-w-md -translate-x-1/2 flex-col gap-2 animate-in slide-in-from-top-5">
            {flash.success && (
                <Alert
                    variant="default"
                    className="border-green-500 bg-green-50 dark:bg-green-950"
                >
                    <CheckCircle2 className="text-green-600 dark:text-green-400" />
                    <AlertTitle className="text-green-800 dark:text-green-200">
                        ¡Éxito!
                    </AlertTitle>
                    <AlertDescription className="text-green-700 dark:text-green-300">
                        {flash.success}
                    </AlertDescription>
                </Alert>
            )}

            {flash.warning && (
                <Alert
                    variant="default"
                    className="border-amber-500 bg-amber-50 dark:bg-amber-950"
                >
                    <AlertTriangle className="text-amber-600 dark:text-amber-400" />
                    <AlertTitle className="text-amber-900 dark:text-amber-100">
                        Aviso
                    </AlertTitle>
                    <AlertDescription className="text-amber-800 dark:text-amber-200">
                        {flash.warning}
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
