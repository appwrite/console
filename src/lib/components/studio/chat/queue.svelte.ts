import type { Action } from './parser';

interface Item<T> {
    id: symbol;
    status: 'waiting' | 'processing' | 'done';
    data: T;
}

type Lists<T> = Record<symbol | string, Item<T>[]>;

class Queue<T> {
    public lists = $state<Record<symbol | string, Item<T>[]>>({});

    public enqueue(list: keyof Lists<T>, item: T): symbol {
        if (!this.lists[list]) {
            this.lists[list] = [];
        }
        const id = Symbol();
        this.lists[list].push({
            id,
            status: 'waiting',
            data: item
        });

        return id;
    }

    public dequeue(list: keyof Lists<T>): Item<T> {
        const item = this.lists[list].find((item) => item.status === 'waiting');
        if (item) {
            item.status = 'processing';
        }

        return item;
    }

    public update(list: keyof Lists<T>, id: symbol, status: Item<T>['status'], data: T): void {
        const item = this.lists[list].find((item) => item.id === id);
        if (item) {
            item.data = data;
            item.status = status;
        }
    }
}

export const queue = new Queue<Action>();
