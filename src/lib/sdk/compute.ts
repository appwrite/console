import type { Client } from '@appwrite.io/console';

/**
 * Proxy-based SDK service for the Compute API.
 *
 * Every method call is forwarded to the API as a POST to
 * `/compute/{methodName}` with the supplied arguments serialised
 * as the JSON body.  This keeps the console in sync with the
 * server without hand-writing a method per endpoint.
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export interface Compute {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [method: string]: any;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class Compute {
    client: Client;

    constructor(client: Client) {
        this.client = client;

        return new Proxy(this, {
            get(target, property, receiver) {
                if (property in target) {
                    return Reflect.get(target, property, receiver);
                }

                if (typeof property === 'symbol') {
                    return undefined;
                }

                const method = property as string;
                const path = `/compute/${camelToKebab(method)}`;

                return (...args: unknown[]) => {
                    const payload =
                        args.length === 1 &&
                        typeof args[0] === 'object' &&
                        args[0] !== null &&
                        !Array.isArray(args[0])
                            ? (args[0] as Record<string, unknown>)
                            : args.reduce<Record<string, unknown>>((accumulator, value, index) => {
                                  accumulator[`arg${index}`] = value;
                                  return accumulator;
                              }, {});

                    const uri = new URL(target.client.config.endpoint + path);

                    return target.client.call(
                        'post',
                        uri,
                        { 'content-type': 'application/json' },
                        payload
                    );
                };
            }
        });
    }
}

function camelToKebab(value: string): string {
    return value.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}
