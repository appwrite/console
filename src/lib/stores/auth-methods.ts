import { writable } from 'svelte/store';
import { type Models, MethodId } from '@appwrite.io/console';

export type AuthMethod = {
    label: string;
    method: MethodId;
    value: boolean | null;
};

const setAuthMethod = (project: Models.Project): AuthMethod[] => {
    return [
        {
            label: 'Email/Password',
            method: MethodId.Emailpassword,
            value: project?.authEmailPassword
        },
        {
            label: 'Phone',
            method: MethodId.Phone,
            value: project?.authPhone
        },
        {
            label: 'Magic URL',
            method: MethodId.Magicurl,
            value: project?.authUsersAuthMagicURL
        },
        {
            label: 'Email OTP',
            method: MethodId.Emailotp,
            value: project?.authEmailOtp
        },
        {
            label: 'Anonymous',
            method: MethodId.Anonymous,
            value: project?.authAnonymous
        },
        {
            label: 'Team Invites',
            method: MethodId.Invites,
            value: project?.authInvites
        },
        {
            label: 'JWT',
            method: MethodId.Jwt,
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
