import { page } from "$app/stores";
import { derived } from "svelte/store";

export const roles = derived(page, ($page) => $page.data.roles);
export const scopes = derived(page, ($page) => $page.data.scopes);
export const isDeveloper = derived(roles, ($roles) => $roles.includes("developer"));

export const canSeeDatabases = derived(scopes, ($scopes) => $scopes.includes("databases.read"));