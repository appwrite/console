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
        Math.min(
            100,
            Math.max(0, (totalCounter.done / (totalCounter.done + totalCounter.processing)) * 100)
        )
    );

    return Number.isNaN(res) ? 0 : res;
}
