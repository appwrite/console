import type { Client } from '@appwrite.io/console';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';

export type WebauthnRegisterChallenge = {
    $id: string;
    userId: string;
    rp: {
        id: string;
        name: string;
        icon: string;
    };
    user: {
        id: string;
        name: string;
        displayName: string;
    };
    challenge: string;
    pubKeyCredParams: any;
    timeout: number;
};

export class Account {
    client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    async createMfaWebauthnAuthenticator(): Promise<WebauthnRegisterChallenge> {
        const path = '/account/mfa/authenticators/webauthn';

        const uri = new URL(this.client.config.endpoint + path);
        return await this.client.call('POST', uri, {
            'content-type': 'application/json'
        });
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

        await this.completeWebauthnMfaAuthenticator(credential);
    }

    async createMfaWebauthnChallenge() {
        const path = '/account/mfa/challenge/webauthn';

        const uri = new URL(this.client.config.endpoint + path);
        return await this.client.call('POST', uri, {
            'content-type': 'application/json'
        });
    }

    async completeMfaWebauthnChallenge(challengeId: string, credential: Credential) {
        const path = '/account/mfa/challenge/webauthn';

        const uri = new URL(this.client.config.endpoint + path);
        return await this.client.call(
            'PUT',
            uri,
            {
                'content-type': 'application/json'
            },
            {
                challengeId: challengeId,
                challengeResponse: JSON.stringify(credential)
            }
        );
    }

    async createMfaWebauthnChallengeHelper() {
        let challenge = await this.createMfaWebauthnChallenge();

        //TODO Replace with native navigator.credentials.create
        let credential = await startAuthentication(challenge);

        await this.completeMfaWebauthnChallenge(challenge.$id, credential);
    }

    async deleteMfaWebauthnAuthenticator(
        challengeId?: string,
        credential?: Credential,
        recoveryKey?: string
    ) {
        const path = '/account/mfa/authenticator/webauthn';

        const uri = new URL(this.client.config.endpoint + path);

        let body = {};

        if (challengeId) {
            body['challengeId'] = challengeId;
        }

        if (credential) {
            body['challengeResponse'] = JSON.stringify(credential);
        }

        if (recoveryKey) {
            body['recoveryKey'] = recoveryKey;
        }

        return await this.client.call(
            'DELETE',
            uri,
            {
                'content-type': 'application/json'
            },
            body
        );
    }

    async deleteMfaWebauthnAuthenticatorHelper() {
        let challenge = await this.createMfaWebauthnChallenge();

        let credential = await startAuthentication(challenge);

        await this.deleteMfaWebauthnAuthenticator(challenge.$id, credential);
    }
}
