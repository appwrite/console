import type { SvelteComponent } from 'svelte';
import { writable } from 'svelte/store';
import Boolean from './boolean.svelte';
import submitBoolean from './boolean.svelte';
import Email from './email.svelte';
import submitEmail from './email.svelte';
import Enum from './enum.svelte';
import submitEnum from './enum.svelte';
import Float from './float.svelte';
import submitFloat from './float.svelte';
import Integer from './integer.svelte';
import submitInteger from './integer.svelte';
import Ip from './ip.svelte';
import submitIp from './ip.svelte';
import String from './string.svelte';
import submitString from './string.svelte';
import Url from './url.svelte';
import submitUrl from './url.svelte';
import Datetime from './datetime.svelte';
import submitDatetime from './datetime.svelte';
import type { Attributes } from '../store';

export type Option = {
    name: string;
    component: typeof SvelteComponent;
    type: 'string' | 'integer' | 'double' | 'boolean' | 'datetime';
    func: (
        databaseId: string,
        collectionId: string,
        key: string,
        data: Partial<Attributes>
    ) => Promise<void>;
    format?: 'email' | 'ip' | 'url' | 'enum';
};

export const options: Option[] = [
    {
        name: 'String',
        component: String,
        type: 'string',
        func: submitString
    },
    {
        name: 'Integer',
        component: Integer,
        type: 'integer',
        func: submitInteger
    },
    {
        name: 'Float',
        component: Float,
        type: 'double',
        func: submitFloat
    },
    {
        name: 'Boolean',
        component: Boolean,
        type: 'boolean',
        func: submitBoolean
    },
    {
        name: 'Datetime',
        component: Datetime,
        type: 'datetime',
        func: submitDatetime
    },
    {
        name: 'Email',
        component: Email,
        type: 'string',
        format: 'email',
        func: submitEmail
    },
    {
        name: 'IP',
        component: Ip,
        type: 'string',
        format: 'ip',
        func: submitIp
    },
    {
        name: 'URL',
        component: Url,
        type: 'string',
        format: 'url',
        func: submitUrl
    },
    {
        name: 'Enum',
        component: Enum,
        type: 'string',
        format: 'enum',
        func: submitEnum
    }
];

export const option = writable<Option>();
