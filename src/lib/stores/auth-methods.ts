import { writable } from 'svelte/store';
import type { Models } from '@aw-labs/appwrite-console';

function createAuthMethods() {
    const { subscribe, set } = writable({
        list: [
            {
                label: 'Password',
                method: 'email-password',
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
                    label: 'Password',
                    method: 'email-password',
                    value: project.authEmailPassword
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
                    label: 'Invites',
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
