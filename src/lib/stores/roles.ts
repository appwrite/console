import { page } from '$app/stores';
import { derived } from 'svelte/store';

export const roles = derived(page, ($page) => $page.data?.roles ?? []);
export const scopes = derived(page, ($page) => $page.data?.scopes ?? []);

export const isDeveloper = derived(roles, ($roles) => $roles.includes('developer'));
export const isBilling = derived(roles, ($roles) => $roles.includes('billing'));
export const isOwner = derived(roles, ($roles) => $roles.includes('owner'));

export const canWriteDatabases = derived(scopes, ($scopes) => $scopes.includes('databases.write'));
export const canWriteProjects = derived(scopes, ($scopes) => $scopes.includes('projects.write'));
export const canWriteFunctions = derived(scopes, ($scopes) => $scopes.includes('functions.write'));
export const canWriteBuckets = derived(scopes, ($scopes) => $scopes.includes('buckets.write'));
export const canWriteProviders = derived(scopes, ($scopes) => $scopes.includes('providers.write'));
export const canWriteMessages = derived(scopes, ($scopes) => $scopes.includes('messages.write'));
export const canWriteWebhooks = derived(scopes, ($scopes) => $scopes.includes('webhooks.write'));
export const canWritePlatforms = derived(scopes, ($scopes) => $scopes.includes('platforms.write'));
export const canWriteTargets = derived(scopes, ($scopes) => $scopes.includes('targets.write'));
export const canWriteUsers = derived(scopes, ($scopes) => $scopes.includes('users.write'));
export const canWriteTeams = derived(scopes, ($scopes) => $scopes.includes('teams.write'));
export const canWriteCollections = derived(scopes, ($scopes) =>
    $scopes.includes('collections.write')
);
export const canWriteSites = derived(scopes, ($scopes) => $scopes.includes('sites.write'));
export const canWriteDomains = derived(scopes, ($scopes) => $scopes.includes('domains.write')); //TODO: check if correct

export const canWriteDocuments = derived(scopes, ($scopes) => $scopes.includes('documents.write'));
export const canWriteExecutions = derived(scopes, ($scopes) =>
    $scopes.includes('executions.write')
);
export const canWriteSubscribers = derived(scopes, ($scopes) =>
    $scopes.includes('subscribers.write')
);
export const canWriteKeys = derived(scopes, ($scopes) => $scopes.includes('keys.write'));
export const canReadKeys = derived(scopes, ($scopes) => $scopes.includes('keys.read'));
export const canWriteRules = derived(scopes, ($scopes) => $scopes.includes('rules.write'));
export const canWriteMigrations = derived(scopes, ($scopes) =>
    $scopes.includes('migrations.write')
);
export const canWriteVcs = derived(scopes, ($scopes) => $scopes.includes('vcs.write'));
export const canWriteTopics = derived(scopes, ($scopes) => $scopes.includes('topics.write'));

export const canSeeBilling = derived(scopes, ($scopes) => $scopes.includes('billing.read'));
export const canSeeProjects = derived(scopes, function ($scopes) {
    return $scopes.includes('projects.read');
});
export const canSeeDatabases = derived(scopes, ($scopes) => $scopes.includes('databases.read'));
export const canSeeFunctions = derived(scopes, ($scopes) => $scopes.includes('functions.read'));
export const canSeeTeams = derived(scopes, ($scopes) => $scopes.includes('teams.read'));
export const canSeeBuckets = derived(scopes, ($scopes) => $scopes.includes('buckets.read'));
export const canSeeMessages = derived(scopes, ($scopes) => $scopes.includes('messages.read'));
export const canSeeSites = derived(scopes, ($scopes) => $scopes.includes('sites.read'));
export const canSeeDomains = derived(scopes, ($scopes) => $scopes.includes('domains.read')); //TODO: check if correct
