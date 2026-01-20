export type Counter = {
    pending: number;
    error: number;
    success: number;
    processing: number;
    skip: number;
    warning: number;
};

type TotalCounter = {
    done: number;
    processing: number;
};

export function calculatePercentage(statusCounters: Record<string, Counter>): number {
    const totalCounter: TotalCounter = Object.values(statusCounters).reduce(
        (curr, acc) => {
            return {
                done: curr.done + acc.success + acc.error + acc.skip + acc.warning,
                processing: curr.processing + Math.max(0, acc.processing) + Math.max(0, acc.pending)
            };
        },
        { done: 0, processing: 0 } as TotalCounter
    );

    const res = Math.round(
        (totalCounter.done / (totalCounter.done + totalCounter.processing)) * 100
    );

    if (Number.isNaN(res)) return 0;
    if (res > 100) return 100;
    if (res < 0) return 0;

    return res;
}
