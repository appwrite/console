import type { SvelteComponent } from 'svelte';
import { writable } from 'svelte/store';
import Boolean from './boolean.svelte';
import Email from './email.svelte';
import Enum from './enum.svelte';
import Float from './float.svelte';
import Integer from './integer.svelte';
import Ip from './ip.svelte';
import String from './string.svelte';
import Url from './url.svelte';

export type Option = {
    name: string;
    component: typeof SvelteComponent;
};

export const options: Option[] = [
    {
        name: 'String',
        component: String
    },
    {
        name: 'Integer',
        component: Integer
    },
    {
        name: 'Float',
        component: Float
    },
    {
        name: 'Boolean',
        component: Boolean
    },
    {
        name: 'Email',
        component: Email
    },
    {
        name: 'IP',
        component: Ip
    },
    {
        name: 'URL',
        component: Url
    },
    {
        name: 'Enum',
        component: Enum
    }
];

export const option = writable<Option>({ name: null, component: null });
