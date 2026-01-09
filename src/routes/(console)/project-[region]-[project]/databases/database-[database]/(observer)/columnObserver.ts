import type { Columns } from '$database/store';
import type { RealtimeResponse } from '$lib/stores/sdk';

export function setupColumnObserver() {
    let expectedCount = 0;
    let resolvePromise: () => void;
    let timeout: ReturnType<typeof setTimeout>;
    let isActive = true;

    const availableColumns = new Set<string>();
    const waitPromise = new Promise<void>((resolve) => (resolvePromise = resolve));

    const columnCreationHandler = (response: RealtimeResponse) => {
        if (!isActive) return;

        const { events, payload } = response;

        if (
            events.includes('databases.*.tables.*.columns.*.create') ||
            events.includes('databases.*.tables.*.columns.*.update')
        ) {
            const asColumn = payload as Columns;
            const columnId = asColumn.key;
            const status = asColumn.status;

            if (status === 'available') {
                availableColumns.add(columnId);

                if (expectedCount > 0 && availableColumns.size >= expectedCount) {
                    clearTimeout(timeout);
                    cleanup();
                    resolvePromise();
                }
            }
        }
    };

    const cleanup = () => {
        isActive = false;
        if (timeout) clearTimeout(timeout);
    };

    // return function to start waiting!
    const startWaiting = (count: number) => {
        expectedCount = count;

        timeout = setTimeout(() => {
            cleanup();
            resolvePromise();
        }, 10000);

        if (availableColumns.size >= expectedCount) {
            clearTimeout(timeout);
            cleanup();
            resolvePromise();
        }
    };

    return {
        cleanup,
        waitPromise,
        startWaiting,
        columnCreationHandler
    };
}
