import type { SvelteComponent } from 'svelte';
import { writable } from 'svelte/store';
import Boolean, { submitBoolean } from './boolean.svelte';
import Email, { submitEmail } from './email.svelte';
import Enum, { submitEnum } from './enum.svelte';
import Float, { submitFloat } from './float.svelte';
import Integer, { submitInteger } from './integer.svelte';
import Ip, { submitIp } from './ip.svelte';
import String, { submitString } from './string.svelte';
import Url, { submitUrl } from './url.svelte';
import Datetime, { submitDatetime } from './datetime.svelte';
import type { Attributes } from '../store';
import Relationship, { submitRelationship } from './relationship.svelte';

export type Option = {
    name: string;
    component: typeof SvelteComponent;
    type: 'string' | 'integer' | 'double' | 'boolean' | 'datetime' | 'relationship';
    func: (
        databaseId: string,
        collectionId: string,
        key: string,
        data: Partial<Attributes>
    ) => Promise<void>;
    format?: 'email' | 'ip' | 'url' | 'enum' | 'relationship';
    icon: string;
};

export const options: Option[] = [
    {
        name: 'String',
        component: String,
        type: 'string',
        func: submitString,
        icon: 'text'
    },
    {
        name: 'Integer',
        component: Integer,
        type: 'integer',
        func: submitInteger,
        icon: 'hashtag'
    },
    {
        name: 'Float',
        component: Float,
        type: 'double',
        func: submitFloat,
        icon: 'hashtag'
    },
    {
        name: 'Boolean',
        component: Boolean,
        type: 'boolean',
        func: submitBoolean,
        icon: 'toggle'
    },
    {
        name: 'Datetime',
        component: Datetime,
        type: 'datetime',
        func: submitDatetime,
        icon: 'calendar'
    },
    {
        name: 'Email',
        component: Email,
        type: 'string',
        format: 'email',
        func: submitEmail,
        icon: 'mail'
    },
    {
        name: 'IP',
        component: Ip,
        type: 'string',
        format: 'ip',
        func: submitIp,
        icon: 'location-marker'
    },
    {
        name: 'URL',
        component: Url,
        type: 'string',
        format: 'url',
        func: submitUrl,
        icon: 'link'
    },
    {
        name: 'Enum',
        component: Enum,
        type: 'string',
        format: 'enum',
        func: submitEnum,
        icon: 'list'
    },
    {
        name: 'Relationship',
        component: Relationship,
        type: 'relationship',
        format: 'relationship',
        func: submitRelationship,
        icon: 'link'
    }
];

export const option = writable<Option>();
