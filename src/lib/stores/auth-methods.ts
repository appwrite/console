import { writable } from 'svelte/store';
import type { Models } from '@appwrite.io/console';

export type AuthMethod = {
    label: string;
    method: string;
    value: boolean | null;
};

const setAuthMethod = (project: Models.Project): AuthMethod[] => {
    return [
        {
            label: 'Email/Password',
            method: 'email-password',
            value: project?.authEmailPassword
        },
        {
            label: 'Phone',
            method: 'phone',
            value: project?.authPhone
        },
        {
            label: 'Magic URL',
            method: 'magic-url',
            value: project?.authUsersAuthMagicURL
        },
        {
            label: 'Anonymous',
            method: 'anonymous',
            value: project?.authAnonymous
        },
        {
            label: 'Team Invites',
            method: 'invites',
            value: project?.authInvites
        },
        {
            label: 'JWT',
            method: 'jwt',
            value: project?.authJWT
        }
    ];
};

function createAuthMethods() {
    const { subscribe, set } = writable({
        list: setAuthMethod(null)
    });

    return {
        subscribe,
        set,
        load: (project: Models.Project) => {
            const list = setAuthMethod(project);
            set({ list });
        }
    };
}

export const authMethods = createAuthMethods();
