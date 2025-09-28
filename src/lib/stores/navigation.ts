import { resolve } from '$app/paths';
import { goto } from '$app/navigation';
import { writable } from 'svelte/store';
import type { Pathname, RouteId, RouteParams } from '$app/types';

export const navigationCancelled = writable(false);

// taken directly from svelte's source!
type ResolveArgs<T extends RouteId | Pathname> = T extends RouteId
    ? RouteParams<T> extends Record<string, never>
        ? [route: T]
        : [route: T, params: RouteParams<T>]
    : [route: T];

export function navigate<T extends RouteId>(
    route: T,
    params?: Record<string, string>
): Promise<void> {
    // type cast is necessary here!
    const resolveArgs = params ? ([route, params] as [T, RouteParams<T>]) : [route];
    const resolvedPathname = resolve(...(resolveArgs as ResolveArgs<T>));

    return goto(resolvedPathname);
}
