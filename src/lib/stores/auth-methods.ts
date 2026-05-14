import { writable } from 'svelte/store';
import { type Models, ProjectAuthMethodId } from '@appwrite.io/console';

export type AuthMethod = {
    label: string;
    method: ProjectAuthMethodId;
    value: boolean | null;
};

const setAuthMethod = (project: Models.Project): AuthMethod[] => {
    const authMethods = new Map(
        project?.authMethods?.map((method) => [method.$id, method.enabled])
    );

    return [
        {
            label: 'Email/Password',
            method: ProjectAuthMethodId.Emailpassword,
            value: authMethods.get(ProjectAuthMethodId.Emailpassword) ?? null
        },
        {
            label: 'Phone',
            method: ProjectAuthMethodId.Phone,
            value: authMethods.get(ProjectAuthMethodId.Phone) ?? null
        },
        {
            label: 'Magic URL',
            method: ProjectAuthMethodId.Magicurl,
            value: authMethods.get(ProjectAuthMethodId.Magicurl) ?? null
        },
        {
            label: 'Email OTP',
            method: ProjectAuthMethodId.Emailotp,
            value: authMethods.get(ProjectAuthMethodId.Emailotp) ?? null
        },
        {
            label: 'Anonymous',
            method: ProjectAuthMethodId.Anonymous,
            value: authMethods.get(ProjectAuthMethodId.Anonymous) ?? null
        },
        {
            label: 'Team Invites',
            method: ProjectAuthMethodId.Invites,
            value: authMethods.get(ProjectAuthMethodId.Invites) ?? null
        },
        {
            label: 'JWT',
            method: ProjectAuthMethodId.Jwt,
            value: authMethods.get(ProjectAuthMethodId.Jwt) ?? null
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
