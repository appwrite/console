import type { Client, Models } from '@appwrite.io/console';
import { startRegistration } from '@simplewebauthn/browser';

export type WebauthnRegisterChallenge = {
    $id: string;
    userId: string;
    rp: {
        id: string;
        name: string;
        icon: string;
    },
    user: {
        id: string;
        name: string;
        displayName: string;
    },
    challenge: string;
    pubKeyCredParams: any;
    timeout: number;
}

export class Account {
    client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    async createMfaWebauthnAuthenticator(): Promise<WebauthnRegisterChallenge> {
        const path = '/account/mfa/authenticators/webauthn';

        const uri = new URL(this.client.config.endpoint + path);
        return await this.client.call(
            'POST',
            uri,
            {
                'content-type': 'application/json'
            },
        );
    }

    async completeWebauthnMfaAuthenticator(credential: Credential) {
        const path = '/account/mfa/authenticators/webauthn';

        const uri = new URL(this.client.config.endpoint + path);
        return await this.client.call(
            'PUT',
            uri,
            {
                'content-type': 'application/json'
            },
            {
                challengeResponse: JSON.stringify(credential)
            }
        );
    }

    async createMfaWebauthnAuthenticatorHelper() {
        let challenge = await this.createMfaWebauthnAuthenticator();

        //TODO Replace with native navigator.credentials.create
        let credential = await startRegistration(challenge);

        let session = await this.completeWebauthnMfaAuthenticator(credential);
        console.log(session);
    }

} 