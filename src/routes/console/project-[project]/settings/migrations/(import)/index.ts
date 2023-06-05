import { wizard } from '$lib/stores/wizard';
import { writable } from 'svelte/store';
import Wizard from './wizard.svelte';

export type Provider = 'appwrite' | 'nhost' | 'supabase' | 'firebase';

type AppwriteInput = {
    endpoint?: string;
    projectID?: string;
    apiKey?: string;
};

type NhostInput = {};

type Inputs = {
    appwrite: AppwriteInput;
    nhost: NhostInput;
    supabase: {};
    firebase: {};
};

type Data = {
    provider?: Provider;
    inputs?: Inputs;
};

const initialState = {
    provider: 'firebase',
    inputs: {
        appwrite: {},
        nhost: {},
        supabase: {},
        firebase: {}
    }
} satisfies Data;

export const data = (function init() {
    const store = writable<Data>({ ...initialState });

    const reset = () => store.set({ ...initialState });

    return { ...store, reset };
})();

export function openImportWizard() {
    wizard.start(Wizard);
}
