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

// Días de alquiler inclusivos (diferencia calendario + 1: el día de inicio cuenta)
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
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

const toDayDate = (value: string): Date | null => {
    const dateOnly = value.includes('T') ? value.slice(0, 10) : value;
    if (!dateOnly?.trim()) {
        return null;
    }
    const date = new Date(
        dateOnly.length === 10 ? `${dateOnly}T12:00:00` : dateOnly,
    );
    return isNaN(date.getTime()) ? null : date;
};

/** Misma regla que StockMovement::rentalDaysInPeriod (inclusivo, +1). */
export const calculateRentalDaysInPeriod = (
    salidaAt: string,
    regresoAt: string | null | undefined,
    periodFrom: string,
    periodTo: string,
): number => {
    const start = toDayDate(salidaAt);
    const end = regresoAt
        ? toDayDate(regresoAt)
        : toDayDate(new Date().toISOString().slice(0, 10));
    const from = toDayDate(periodFrom);
    const to = toDayDate(periodTo);

    if (!start || !end || !from || !to || from > to) {
        return 0;
    }

    const overlapStart = start > from ? start : from;
    const overlapEnd = end < to ? end : to;

    if (overlapStart > overlapEnd) {
        return 0;
    }

    return calculateRentalDays(
        overlapStart.toISOString().slice(0, 10),
        overlapEnd.toISOString().slice(0, 10),
    );
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
