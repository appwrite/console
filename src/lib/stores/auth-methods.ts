import { writable } from 'svelte/store';
import type { Models } from '@aw-labs/appwrite-console';

export type AuthMethod = {
    label: string;
    method: string;
    value: boolean | null;
};

function createAuthMethods() {
    const { subscribe, set } = writable({
        list: [
            {
                label: 'Email/Password',
                method: 'email-password',
                value: null
            },
            {
                label: 'Phone',
                method: 'phone',
                value: null
            },
            {
                label: 'Magic URL',
                method: 'magic-url',
                value: null
            },
            {
                label: 'Anonymous',
                method: 'anonymous',
                value: null
            },
            {
                label: 'Invites',
                method: 'invites',
                value: null
            },
            {
                label: 'JWT',
                method: 'jwt',
                value: null
            }
        ]
    });

    return {
        subscribe,
        set,
        load: (project: Models.Project) => {
            const list = [
                {
                    label: 'Email/Password',
                    method: 'email-password',
                    value: project.authEmailPassword
                },
                {
                    label: 'Phone',
                    method: 'phone',
                    value: project.authPhone
                },
                {
                    label: 'Magic URL',
                    method: 'magic-url',
                    value: project.authUsersAuthMagicURL
                },
                {
                    label: 'Anonymous',
                    method: 'anonymous',
                    value: project.authAnonymous
                },
                {
                    label: 'Team Invites',
                    method: 'invites',
                    value: project.authInvites
                },
                {
                    label: 'JWT',
                    method: 'jwt',
                    value: project.authJWT
                }
            ];
            set({ list });
        }
    };
}

export const authMethods = createAuthMethods();
