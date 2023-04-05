import type { Models, Payload } from '@appwrite.io/console';
import { Service } from './service';

export class Project extends Service {
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
