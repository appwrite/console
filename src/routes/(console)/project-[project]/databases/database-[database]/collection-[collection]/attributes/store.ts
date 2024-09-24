import type { SvelteComponent } from 'svelte';
import { writable } from 'svelte/store';
import Boolean, { submitBoolean, updateBoolean } from './boolean.svelte';
import Email, { submitEmail, updateEmail } from './email.svelte';
import Enum, { submitEnum, updateEnum } from './enum.svelte';
import Float, { submitFloat, updateFloat } from './float.svelte';
import Integer, { submitInteger, updateInteger } from './integer.svelte';
import Ip, { submitIp, updateIp } from './ip.svelte';
import String, { submitString, updateString } from './string.svelte';
import Url, { submitUrl, updateUrl } from './url.svelte';
import Datetime, { submitDatetime, updateDatetime } from './datetime.svelte';
import type { Attributes } from '../store';
import Relationship, { submitRelationship, updateRelationship } from './relationship.svelte';

export type Option = {
    name:
        | 'String'
        | 'Integer'
        | 'Float'
        | 'Boolean'
        | 'Datetime'
        | 'Email'
        | 'IP'
        | 'URL'
        | 'Enum'
        | 'Relationship';
    component: typeof SvelteComponent<unknown>;
    type: 'string' | 'integer' | 'double' | 'boolean' | 'datetime' | 'relationship';
    create: (
        databaseId: string,
        collectionId: string,
        key: string,
        data: Partial<Attributes>
    ) => Promise<void>;
    update: (
        databaseId: string,
        collectionId: string,
        data: Partial<Attributes>,
        originalKey: string
    ) => Promise<void>;
    format?: 'email' | 'ip' | 'url' | 'enum';
    icon: string;
};

export const attributeOptions: Option[] = [
    {
        name: 'String',
        component: String,
        type: 'string',
        create: submitString,
        update: updateString,
        icon: 'text'
    },
    {
        name: 'Integer',
        component: Integer,
        type: 'integer',
        create: submitInteger,
        update: updateInteger,
        icon: 'hashtag'
    },
    {
        name: 'Float',
        component: Float,
        type: 'double',
        create: submitFloat,
        update: updateFloat,
        icon: 'hashtag'
    },
    {
        name: 'Boolean',
        component: Boolean,
        type: 'boolean',
        create: submitBoolean,
        update: updateBoolean,
        icon: 'toggle'
    },
    {
        name: 'Datetime',
        component: Datetime,
        type: 'datetime',
        create: submitDatetime,
        update: updateDatetime,
        icon: 'calendar'
    },
    {
        name: 'Email',
        component: Email,
        type: 'string',
        format: 'email',
        create: submitEmail,
        update: updateEmail,
        icon: 'mail'
    },
    {
        name: 'IP',
        component: Ip,
        type: 'string',
        format: 'ip',
        create: submitIp,
        update: updateIp,
        icon: 'location-marker'
    },
    {
        name: 'URL',
        component: Url,
        type: 'string',
        format: 'url',
        create: submitUrl,
        update: updateUrl,
        icon: 'link'
    },
    {
        name: 'Enum',
        component: Enum,
        type: 'string',
        format: 'enum',
        create: submitEnum,
        update: updateEnum,
        icon: 'view-list'
    },
    {
        name: 'Relationship',
        component: Relationship,
        type: 'relationship',
        create: submitRelationship,
        update: updateRelationship,
        icon: 'relationship'
    }
];

export const option = writable<Option>();
