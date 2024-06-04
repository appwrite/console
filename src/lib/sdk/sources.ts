import type { Client } from '@appwrite.io/console';

type Source = {
    $id: string;
    fingerprint: string;
    referrer: string;
    ref: string;
    utmSource: string;
    utmCampaign: string;
    utmMedium: string;
};

export class Sources {
    client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    async create(
        ref: string,
        referrer: string,
        utmSource: string,
        utmCampaign: string,
        utmMedium: string
    ): Promise<Source> {
        const path = `/console/sources`;
        const params = {
            ref,
            referrer,
            utmSource,
            utmCampaign,
            utmMedium
        };
        const uri = new URL(this.client.config.endpoint + path);
        return await this.client.call(
            'POST',
            uri,
            {
                'content-type': 'application/json'
            },
            params
        );
    }
}
