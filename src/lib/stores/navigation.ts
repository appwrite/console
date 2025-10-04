import { resolve } from '$app/paths';
import { goto } from '$app/navigation';
import type { Pathname, RouteId, RouteParams } from '$app/types';

// taken directly from svelte's source!
type ResolveArgs<T extends RouteId | Pathname> = T extends RouteId
    ? RouteParams<T> extends Record<string, never>
        ? [route: T]
        : [route: T, params: RouteParams<T>]
    : [route: T];

export function withPath(base: string, ...parts: string[]) {
    return [base.replace(/\/+$/, ''), ...parts].join('/');
}

export function resolveRoute<T extends RouteId>(route: T, params?: Record<string, string>) {
    // type cast is necessary here!
    const resolveArgs = params ? ([route, params] as [T, RouteParams<T>]) : [route];

    return resolve(...(resolveArgs as ResolveArgs<T>));
}

export function navigate<T extends RouteId>(
    route: T,
    params?: Record<string, string>
): Promise<void> {
    // type cast is necessary here!
    return goto(resolveRoute(route, params));
}
