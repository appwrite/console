import { writable } from 'svelte/store';
import { type Models, ProjectAuthMethodId as MethodId } from '@appwrite.io/console';

export type AuthMethod = {
    label: string;
    method: MethodId;
    value: boolean | null;
};

const setAuthMethod = (project: Models.Project): AuthMethod[] => {
    const authMethods = new Map(
        project?.authMethods?.map((method) => [method.$id, method.enabled])
    );

    return [
        {
            label: 'Email/Password',
            method: MethodId.Emailpassword,
            value: authMethods.get(MethodId.Emailpassword) ?? null
        },
        {
            label: 'Phone',
            method: MethodId.Phone,
            value: authMethods.get(MethodId.Phone) ?? null
        },
        {
            label: 'Magic URL',
            method: MethodId.Magicurl,
            value: authMethods.get(MethodId.Magicurl) ?? null
        },
        {
            label: 'Email OTP',
            method: MethodId.Emailotp,
            value: authMethods.get(MethodId.Emailotp) ?? null
        },
        {
            label: 'Anonymous',
            method: MethodId.Anonymous,
            value: authMethods.get(MethodId.Anonymous) ?? null
        },
        {
            label: 'Team Invites',
            method: MethodId.Invites,
            value: authMethods.get(MethodId.Invites) ?? null
        },
        {
            label: 'JWT',
            method: MethodId.Jwt,
            value: authMethods.get(MethodId.Jwt) ?? null
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
