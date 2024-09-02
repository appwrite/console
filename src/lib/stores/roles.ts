import { page } from "$app/stores";
import { derived } from "svelte/store";

export const roles = derived(page, function ($page) {
    console.log("roles", $page.data.roles);
        return $page.data.roles;
    });
export const scopes = derived(page, ($page) => $page.data.scopes);
export const isDeveloper = derived(roles, ($roles) => $roles.includes("developer"));
export const isBilling = derived(roles, function ($roles) {
        let isBilling= $roles.includes("billing");
        console.log("isBilling", isBilling);
        return isBilling;
    });
export const isOwner = derived(roles, ($roles) => $roles.includes("owner"));
export const canSeeDatabases = derived(scopes, ($scopes) => $scopes.includes("databases.read"));