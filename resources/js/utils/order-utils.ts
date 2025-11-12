// Función para formatear fechas
export const formatDate = (dateString: string | Date): string => {
    let finalDateString = dateString;
    if (typeof dateString === 'string' && dateString.length === 10) {
        finalDateString = `${dateString}T12:00:00`; 
    }
    
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(finalDateString).toLocaleDateString('ES-AR', options);
};

// Función para calcular días de alquiler
export const calculateRentalDays = (date_from: string, date_to: string): number => {
    const from = new Date(date_from);
    const to = new Date(date_to);
    const diffTime = Math.abs(to.getTime() - from.getTime()); // Usar .getTime() para las fechas
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Función para obtener el color del estado
export const getStatusColor = (status: string): string => {
    const statusColors: { [key: string]: string } = {
        Iniciada: 'bg-blue-100 text-blue-800',
        Asignada: 'bg-green-100 text-green-800',
        // Agrega más estados aquí
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
};