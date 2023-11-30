import { derived } from 'svelte/store';
import { page } from '$app/stores';
import type { Message } from '../store';

export const message = derived(page, ($page) => $page.data.message as Message);
