/**
 * Webhooks SDK compatibility shim.
 *
 * @todo Remove once @appwrite.io/console is updated to include both BAA addon
 * methods and the Webhooks class (currently split across two SDK commits).
 */
import type { Client, Models } from '@appwrite.io/console';

export class Webhooks {
    private client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    async list(params?: { queries?: string[]; total?: boolean }): Promise<Models.WebhookList> {
        const payload: Record<string, unknown> = {};
        if (params?.queries !== undefined) payload['queries'] = params.queries;
        if (params?.total !== undefined) payload['total'] = params.total;
        const uri = new URL(this.client.config.endpoint + '/webhooks');
        return this.client.call('get', uri, {}, payload);
    }

    async create(params: {
        webhookId: string;
        url: string;
        name: string;
        events: string[];
        enabled?: boolean;
        security?: boolean;
        httpUser?: string;
        httpPass?: string;
    }): Promise<Models.Webhook> {
        const payload: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(params)) {
            if (value !== undefined) payload[key] = value;
        }
        const uri = new URL(this.client.config.endpoint + '/webhooks');
        return this.client.call('post', uri, { 'content-type': 'application/json' }, payload);
    }

    async get(params: { webhookId: string }): Promise<Models.Webhook> {
        const uri = new URL(this.client.config.endpoint + `/webhooks/${params.webhookId}`);
        return this.client.call('get', uri, {}, {});
    }

    async update(params: {
        webhookId: string;
        name: string;
        url: string;
        events: string[];
        enabled?: boolean;
        security?: boolean;
        httpUser?: string;
        httpPass?: string;
    }): Promise<Models.Webhook> {
        const { webhookId, ...rest } = params;
        const payload: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(rest)) {
            if (value !== undefined) payload[key] = value;
        }
        const uri = new URL(this.client.config.endpoint + `/webhooks/${webhookId}`);
        return this.client.call('put', uri, { 'content-type': 'application/json' }, payload);
    }

    async delete(params: { webhookId: string }): Promise<void> {
        const uri = new URL(this.client.config.endpoint + `/webhooks/${params.webhookId}`);
        return this.client.call('delete', uri, { 'content-type': 'application/json' }, {});
    }

    async updateSignature(params: { webhookId: string }): Promise<Models.Webhook> {
        const uri = new URL(
            this.client.config.endpoint + `/webhooks/${params.webhookId}/signature`
        );
        return this.client.call('patch', uri, { 'content-type': 'application/json' }, {});
    }
}
