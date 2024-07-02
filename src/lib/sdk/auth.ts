import { type Client, type Models } from '@appwrite.io/console';

export type MockNumber = {
    phone: string;
    otp: string;
};

export type Project = Models.Project & {
    authMockNumbers: MockNumber[];
};

export class Auth {
    client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    async updateMockNumbers(projectId: string, numbers: MockNumber[]): Promise<Project> {
        const path = `/projects/${projectId}/auth/mock-numbers`;
        const params = {
            projectId,
            numbers: numbers
        };
        const uri = new URL(this.client.config.endpoint + path);
        return await this.client.call(
            'patch',
            uri,
            {
                'content-type': 'application/json'
            },
            params
        );
    }
}
