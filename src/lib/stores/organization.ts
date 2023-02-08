import { page } from '$app/stores';
import { derived, writable } from 'svelte/store';
import type { Models } from '@aw-labs/appwrite-console';

export const newOrgModal = writable<boolean>(false);
export const newMemberModal = writable<boolean>(false);
export const organizationList = derived(
    page,
    ($page) => $page.data.organizations as Models.TeamList
);
export const organization = derived(page, ($page) => $page.data.organization as Models.Team);
export const members = derived(page, ($page) => $page.data.members as Models.MembershipList);
