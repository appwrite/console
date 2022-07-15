import type { SvelteComponent } from 'svelte';
import { writable } from 'svelte/store';
import Boolean from './_boolean.svelte';
import Email from './_email.svelte';
import Enum from './_enum.svelte';
import Float from './_float.svelte';
import Integer from './_integer.svelte';
import Ip from './_ip.svelte';
import String from './_string.svelte';
import Url from './_url.svelte';

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
