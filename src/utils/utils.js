import { differenceInCalendarDays, parse, parseISO, isValid, startOfDay } from 'date-fns';

export function calculateDaysRemaining(endDateStr) {
    if (!endDateStr || endDateStr === 'N/A') return { days: 0, label: 'Vigencia no detectada', color: 'gray' };

    const today = startOfDay(new Date());
    let endDate;

    // Intentar parsear formato ISO (YYYY-MM-DD)
    endDate = parseISO(endDateStr);

    // Si no es válido, intentar formato común mexicano (DD/MM/YYYY)
    if (!isValid(endDate)) {
        endDate = parse(endDateStr, 'dd/MM/yyyy', new Date());
    }

    // Si sigue sin ser válido, intentar con guiones (DD-MM-YYYY)
    if (!isValid(endDate)) {
        endDate = parse(endDateStr, 'dd-MM-yyyy', new Date());
    }

    if (!isValid(endDate)) return { days: 0, label: 'Fecha inválida', color: 'gray' };

    const diff = differenceInCalendarDays(startOfDay(endDate), today);

    if (diff < 0) {
        return { days: diff, label: `Vencida hace ${Math.abs(diff)} días`, color: 'red' };
    } else if (diff === 0) {
        return { days: 0, label: 'Vence hoy', color: 'orange' };
    } else if (diff === 1) {
        return { days: 1, label: 'Vence mañana', color: 'orange' };
    } else {
        return { days: diff, label: `${diff} días para vencimiento`, color: 'green' };
    }
}

export function formatCurrency(amount) {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
    }).format(amount);
}
