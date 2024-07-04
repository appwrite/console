import type { Client } from '@appwrite.io/console';

export class Func {
    client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    async downloadDeployment(functionId: string, deploymentId: string): Promise<string> {
        const path = `/functions/${functionId}/deployments/${deploymentId}/download`;
        const params = {
            functionId,
            deploymentId
        };
        const uri = new URL(this.client.config.endpoint + path);
        return await this.client.call(
            'GET',
            uri,
            {
                'content-type': 'application/json'
            },
            params
        );
    }
}
