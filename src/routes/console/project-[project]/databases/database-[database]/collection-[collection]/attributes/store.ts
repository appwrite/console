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
    type: 'string' | 'integer' | 'double' | 'boolean';
    format?: 'email' | 'ip' | 'url' | 'enum';
};

export const options: Option[] = [
    {
        name: 'String',
        component: String,
        type: 'string'
    },
    {
        name: 'Integer',
        component: Integer,
        type: 'integer'
    },
    {
        name: 'Float',
        component: Float,
        type: 'double'
    },
    {
        name: 'Boolean',
        component: Boolean,
        type: 'boolean'
    },
    {
        name: 'Email',
        component: Email,
        type: 'string',
        format: 'email'
    },
    {
        name: 'IP',
        component: Ip,
        type: 'string',
        format: 'ip'
    },
    {
        name: 'URL',
        component: Url,
        type: 'string',
        format: 'url'
    },
    {
        name: 'Enum',
        component: Enum,
        type: 'string',
        format: 'enum'
    }
];

export const option = writable<Option>();
