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
	icon: string;
};

export const options: Option[] = [
	{
		name: 'String',
		component: String,
		icon: 'string'
	},
	{
		name: 'Integer',
		component: Integer,
		icon: 'integer'
	},
	{
		name: 'Float',
		component: Float,
		icon: 'integer'
	},
	{
		name: 'Boolean',
		component: Boolean,
		icon: 'boolean'
	},
	{
		name: 'Email',
		component: Email,
		icon: 'email'
	},
	{
		name: 'IP',
		component: Ip,
		icon: 'ip'
	},
	{
		name: 'URL',
		component: Url,
		icon: 'url'
	},
	{
		name: 'Enum',
		component: Enum,
		icon: 'enum'
	}
];

export const option = writable<Option>();
