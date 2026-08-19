import { ProjectUsageRange, type Models } from '@appwrite.io/console';

export type UsagePeriods = '24h' | '30d' | '90d';

export function periodToDates(period: UsagePeriods): {
    start: string;
    end: string;
    period: ProjectUsageRange;
} {
    const start = new Date();
    switch (period) {
        case '24h':
            start.setUTCHours(start.getHours() - 24);
            break;
        case '30d':
            start.setUTCHours(0, 0, 0, 0);
            start.setUTCDate(start.getDate() - 30);
            break;
        case '90d':
            start.setUTCHours(0, 0, 0, 0);
            start.setUTCDate(start.getDate() - 90);
            break;
    }
    const end = new Date();
    end.setUTCDate(end.getUTCDate() + 1);
    end.setUTCHours(0, 0, 0, 0);
    return {
        start: start.toISOString(),
        end: end.toISOString(),
        period: period === '24h' ? ProjectUsageRange.OneHour : ProjectUsageRange.OneDay
    };
}

export function last(set: Models.Metric[]): Models.Metric | null {
    if (!set) return null;
    return set.slice(-1)[0] ?? null;
}

export function total(set: Models.Metric[]): number {
    return set?.reduce((prev, curr) => prev + curr.value, 0) ?? 0;
}

export function accumulateFromEndingTotal(
    metrics: Models.Metric[],
    endingTotal: number,
    startingDayToFillZero: Date = null
): Array<[string, number]> {
    return (metrics ?? []).reduceRight(
        (acc, curr) => {
            if (startingDayToFillZero !== null && startingDayToFillZero instanceof Date) {
                const date = new Date(curr.date);
                if (date > startingDayToFillZero) {
                    acc.data.unshift([date.toISOString(), 0]);
                    acc.total -= 0;

                    return acc;
                }
            }
            acc.data.unshift([curr.date, acc.total]);
            acc.total -= curr.value;
            return acc;
        },
        {
            total: endingTotal,
            data: []
        }
    ).data;
}
