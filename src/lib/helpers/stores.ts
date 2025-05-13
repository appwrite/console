import { writable, type Writable } from 'svelte/store';
import { deepClone, objectEntries } from './object';

/**
 * Given an object `obj`, returns an object of writable stores for each key in that object.
 *
 * Also returns a listen method that accepts an object of the same shape as `obj` and updates
 * the stores with the values from that object if they are different.
 *
 * @export
 */
export function createConservative<Obj extends Record<string, unknown>>(obj: Obj) {
    const stores = Object.fromEntries(
        objectEntries(obj).map(([key, value]) => [key, writable(value)])
    ) as {
        [K in keyof Obj]: Writable<Obj[K]>;
    };

    const history = deepClone(obj);

    function listen(input: Obj) {
        objectEntries(input).forEach(([key, value]) => {
            if (!(key in stores) || !(key in history)) {
                return;
            }
            const curr = history[key];
            if (curr !== value) {
                stores[key].set(value);
                history[key] = value;
            }
        });
    }

    return {
        stores,
        listen
    };
}

export function asyncWritable<T>(initialPromise?: Promise<T> | T) {
    const { subscribe, set: setState } = writable<
        | {
              loading: true;
              error: null;
              data: null;
          }
        | {
              loading: false;
              error: Error;
              data: null;
          }
        | {
              loading: false;
              error: null;
              data: T;
          }
    >({
        loading: true,
        error: null,
        data: null
    });

    function run(promise: typeof initialPromise) {
        setState({ loading: true, error: null, data: null });
        if (promise instanceof Promise) {
            promise
                .then((data) => {
                    setState({ loading: false, error: null, data });
                })
                .catch((error) => {
                    setState({ loading: false, error, data: null });
                });
        } else {
            setState({ loading: false, error: null, data: promise });
        }
    }

    if (initialPromise) run(initialPromise);

    return {
        subscribe,
        set: run
    };
}
