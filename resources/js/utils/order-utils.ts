// Función para formatear fechas
export const formatDate = (dateString?: string | Date | null): string => {
    if (!dateString) {
        return 'No definida';
    }

    let date: Date;

    if (typeof dateString === 'string') {
        // Evita strings vacíos o inválidos
        if (!dateString.trim()) {
            return 'No definida';
        }

        // Si viene como YYYY-MM-DD
        const finalDateString =
            dateString.length === 10 ? `${dateString}T12:00:00` : dateString;

        date = new Date(finalDateString);
    } else {
        date = dateString;
    }

    // Validación real de fecha
    if (isNaN(date.getTime())) {
        return 'No definida';
    }

    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    };

    return date.toLocaleDateString('es-AR', options);
};

// Función para calcular días de alquiler (diferencia en días calendario entre fechas)
export const calculateRentalDays = (
    date_from: string,
    date_to: string,
): number => {
    if (!date_from?.trim() || !date_to?.trim()) {
        return 0;
    }

    const toLocalNoon = (s: string) => (s.length === 10 ? `${s}T12:00:00` : s);

    const from = new Date(toLocalNoon(date_from));
    const to = new Date(toLocalNoon(date_to));
    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
        return 0;
    }

    const diffTime = Math.abs(to.getTime() - from.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Función para obtener el color del estado
export function getStatusVariant(status: string) {
    //console.log(status);
    switch (status) {
        case 'Iniciada':
            return 'default';
        case 'Asignada':
            return 'warning';
        case 'En curso':
            return 'success';
        case 'Finalizada':
            return 'destructive';
        default:
            return 'default';
    }
}
