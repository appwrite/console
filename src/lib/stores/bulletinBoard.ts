import { writable } from 'svelte/store';

export type Bullet = {
    id: number;
    type: 'success' | 'error' | 'info' | 'warning';
    status: 'unread' | 'read';
    message: string;
    important: boolean;
    dismissible?: boolean;
    title?: string;
    label?: string;
    buttons?: Buttons[];
};

export type BulletinCenter = {
    bullets: Bullet[];
    unread: number;
};

export type Buttons = {
    method: () => void | Promise<void>;
    name: string;
};

let counter = 0;

export const bullets = writable<Bullet[]>([]);

export const markAsRead = (id: number) => {
    bullets.update((all) =>
        all.map((t) => {
            if (t.id === id) {
                t.status = 'read';
            }
            return t;
        })
    );
};

export const markAllAsRead = () => {
    bullets.update((all) =>
        all.map((t) => {
            t.status = 'read';
            return t;
        })
    );
};

export const addBullet = (bullet: Omit<Bullet, 'id'>) => {
    const defaults = {
        id: counter++,
        type: 'info',
        status: 'unread',
        important: false,
        dismissible: true
    };

    const n = { ...defaults, ...bullet };
    bullets.update(() => {
        return [n];
    });
};
