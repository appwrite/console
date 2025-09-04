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
import Point, { submitPoint, updatePoint } from './point.svelte';
import Line, { submitLine, updateLine } from './line.svelte';
import Polygon, { submitPolygon, updatePolygon } from './polygon.svelte';
import type { Columns } from '../store';
import Relationship, { submitRelationship, updateRelationship } from './relationship.svelte';
import {
    IconCalendar,
    IconHashtag,
    IconLink,
    IconList,
    IconLocationMarker,
    IconMail,
    IconRelationship,
    IconText,
    IconToggle,
    IconGlobe
} from '@appwrite.io/pink-icons-svelte';
import type { ComponentType } from 'svelte';

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
        | 'Relationship'
        | 'Point'
        | 'Line'
        | 'Polygon';
    sentenceName: string;
    component: Component;
    type:
        | 'string'
        | 'integer'
        | 'double'
        | 'boolean'
        | 'datetime'
        | 'relationship'
        | 'point'
        | 'line'
        | 'polygon';
    create: (
        databaseId: string,
        tableId: string,
        key: string,
        data: Partial<Columns>
    ) => Promise<void>;
    update: (
        databaseId: string,
        tableId: string,
        data: Partial<Columns>,
        originalKey: string
    ) => Promise<void>;
    format?: 'email' | 'ip' | 'url' | 'enum';
    icon: ComponentType;
};

export const columnOptions: Option[] = [
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
        name: 'Point',
        sentenceName: 'point',
        component: Point,
        type: 'point',
        create: submitPoint,
        update: updatePoint,
        icon: IconGlobe
    },
    {
        name: 'Line',
        sentenceName: 'line',
        component: Line,
        type: 'line',
        create: submitLine,
        update: updateLine,
        icon: IconGlobe
    },
    {
        name: 'Polygon',
        sentenceName: 'polygon',
        component: Polygon,
        type: 'polygon',
        create: submitPolygon,
        update: updatePolygon,
        icon: IconGlobe
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
        icon: IconList
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
