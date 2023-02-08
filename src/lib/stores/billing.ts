import type { Client } from "@aw-labs/appwrite-console";

export class Billing {
    client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    async createPaymentMethod(teamId: string) {
        const path = `/teams/${teamId}/payment-methods`;
        const params = {};
        const uri = new URL(this.client.config.endpoint + path);
        this.client.call('POST', uri, {}, params);
    }
}