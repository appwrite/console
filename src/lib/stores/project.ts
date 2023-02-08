import type { Client, Models } from '@aw-labs/appwrite-console';

type Payload = {
    [key: string]: any;
};

class Service {
    static CHUNK_SIZE = 5 * 1024 * 1024; // 5MB

    client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    static flatten(data: Payload, prefix = ''): Payload {
        let output: Payload = {};

        for (const key in data) {
            const value = data[key];
            const finalKey = prefix ? `${prefix}[${key}]` : key;

            if (Array.isArray(value)) {
                output = Object.assign(output, this.flatten(value, finalKey));
            } else {
                output[finalKey] = value;
            }
        }

        return output;
    }
}

export class Project extends Service {
    constructor(client: Client) {
        super(client);
    }

    /**
     * Get usage stats for a project
     *
     *
     * @param {string} range
     * @throws {AppwriteException}
     * @returns {Promise}
     */
    async getUsage(range?: string): Promise<Models.UsageProject> {
        const path = '/project/usage';
        const payload: Payload = {};

        if (typeof range !== 'undefined') {
            payload['range'] = range;
        }

        const uri = new URL(this.client.config.endpoint + path);
        return await this.client.call(
            'get',
            uri,
            {
                'content-type': 'application/json'
            },
            payload
        );
    }
}
