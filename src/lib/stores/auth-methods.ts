import { writable } from 'svelte/store';
import { type Models, AuthMethod as AuthMethodEnum } from '@appwrite.io/console';

export type AuthMethod = {
    label: string;
    method: AuthMethodEnum;
    value: boolean | null;
};

const setAuthMethod = (project: Models.Project): AuthMethod[] => {
    return [
        {
            label: 'Email/Password',
            method: AuthMethodEnum.Emailpassword,
            value: project?.authEmailPassword
        },
        {
            label: 'Phone',
            method: AuthMethodEnum.Phone,
            value: project?.authPhone
        },
        {
            label: 'Magic URL',
            method: AuthMethodEnum.Magicurl,
            value: project?.authUsersAuthMagicURL
        },
        {
            label: 'Email OTP',
            method: AuthMethodEnum.Emailotp,
            value: project?.authEmailOtp
        },
        {
            label: 'Anonymous',
            method: AuthMethodEnum.Anonymous,
            value: project?.authAnonymous
        },
        {
            label: 'Team Invites',
            method: AuthMethodEnum.Invites,
            value: project?.authInvites
        },
        {
            label: 'JWT',
            method: AuthMethodEnum.Jwt,
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
