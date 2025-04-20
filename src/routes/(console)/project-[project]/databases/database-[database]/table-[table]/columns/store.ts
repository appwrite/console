import type { Component } from 'svelte';
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
import {
    IconCalendar,
    IconHashtag,
    IconLink,
    IconLocationMarker,
    IconMail,
    IconRelationship,
    IconText,
    IconToggle,
    IconViewList
} from '@appwrite.io/pink-icons-svelte';

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
    sentenceName: string;
    component: Component;
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
    icon: Component;
};

export const attributeOptions: Option[] = [
    {
        name: 'String',
        sentenceName: 'string',
        component: String,
        type: 'string',
        create: submitString,
        update: updateString,
        icon: IconText
    },
    {
        name: 'Integer',
        sentenceName: 'integer',
        component: Integer,
        type: 'integer',
        create: submitInteger,
        update: updateInteger,
        icon: IconHashtag
    },
    {
        name: 'Float',
        sentenceName: 'float',
        component: Float,
        type: 'double',
        create: submitFloat,
        update: updateFloat,
        icon: IconHashtag
    },
    {
        name: 'Boolean',
        sentenceName: 'boolean',
        component: Boolean,
        type: 'boolean',
        create: submitBoolean,
        update: updateBoolean,
        icon: IconToggle
    },
    {
        name: 'Datetime',
        sentenceName: 'datetime',
        component: Datetime,
        type: 'datetime',
        create: submitDatetime,
        update: updateDatetime,
        icon: IconCalendar
    },
    {
        name: 'Email',
        sentenceName: 'email',
        component: Email,
        type: 'string',
        format: 'email',
        create: submitEmail,
        update: updateEmail,
        icon: IconMail
    },
    {
        name: 'IP',
        sentenceName: 'IP',
        component: Ip,
        type: 'string',
        format: 'ip',
        create: submitIp,
        update: updateIp,
        icon: IconLocationMarker
    },
    {
        name: 'URL',
        sentenceName: 'URL',
        component: Url,
        type: 'string',
        format: 'url',
        create: submitUrl,
        update: updateUrl,
        icon: IconLink
    },
    {
        name: 'Enum',
        sentenceName: 'enum',
        component: Enum,
        type: 'string',
        format: 'enum',
        create: submitEnum,
        update: updateEnum,
        icon: IconViewList
    },
    {
        name: 'Relationship',
        sentenceName: 'relationship',
        component: Relationship,
        type: 'relationship',
        create: submitRelationship,
        update: updateRelationship,
        icon: IconRelationship
    }
];

export const option = writable<Option>();
