import type { Action } from './parser';

interface Item<T> {
    id: symbol;
    status: 'waiting' | 'processing' | 'done';
    data: T;
}

type Lists<T> = Record<symbol | string, Item<T>[]>;

class Queue<T> {
    public lists = $state<Record<symbol | string, Item<T>[]>>({});
    private forcedStatusLists: Record<symbol | string, Item<T>['status']> = {};

    public enqueue(list: keyof Lists<T>, item: T): symbol {
        if (!this.lists[list]) {
            this.lists[list] = [];
        }
        const id = Symbol();
        const status = this.forcedStatusLists[list] || 'waiting';
        this.lists[list].push({
            id,
            status,
            data: item
        });

        return id;
    }

    public forceListStatus(list: keyof Lists<T>, status: Item<T>['status']): void {
        this.forcedStatusLists[list] = status;
    }

    public dequeue(list: keyof Lists<T>): Item<T> {
        const item = this.lists[list].find((item) => item.status === 'waiting');
        if (!item) {
            return null;
        }
        item.status = 'processing';

        return item;
    }

    public update(
        list: keyof Lists<T>,
        id: symbol,
        value?: {
            status?: Item<T>['status'];
            data?: T;
        }
    ): void {
        const item = this.lists[list].find((item) => item.id === id);
        if (!item) return;

        if (value.status) {
            item.status = value.status;
        }
        if (value.data) {
            item.data = value.data;
        }
    }
}

export const queue = new Queue<Action>();
