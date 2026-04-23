<script lang="ts">
    import { goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { Query, type Models } from '@appwrite.io/console';
    import { Layout, Modal, Typography, Icon, Spinner, Tag } from '@appwrite.io/pink-svelte';
    import { IconDuplicate, IconSearch } from '@appwrite.io/pink-icons-svelte';
    import { Dependencies } from '$lib/constants';
    import { sdk } from '$lib/stores/sdk';
    import { user } from '$lib/stores/user';
    import { AvatarInitials, Copy } from '$lib/components';
    import {
        readOperatorSnapshot,
        startImpersonation,
        readImpersonationTargetUserId
    } from '$lib/appwrite/impersonation';
    import type { OperatorSnapshot, TargetSnapshot } from '$lib/appwrite/impersonation';

    export let show = false;

    const RECENTS_KEY_PREFIX = 'console.impersonation.recents.';
    const MAX_RECENTS = 5;

    type RecentTarget = { $id: string; name: string; email: string };

    function recentsKey(): string | null {
        const op = readOperatorSnapshot();
        const id = op?.$id ?? $user?.$id;
        return id ? `${RECENTS_KEY_PREFIX}${id}` : null;
    }

    function readRecents(): RecentTarget[] {
        const key = recentsKey();
        if (!key) return [];
        try {
            return JSON.parse(localStorage.getItem(key) ?? '[]');
        } catch {
            return [];
        }
    }

    function saveRecent(target: { $id: string; name: string; email: string }) {
        const key = recentsKey();
        if (!key) return;
        const existing = readRecents().filter((r) => r.$id !== target.$id);
        const updated: RecentTarget[] = [
            { $id: target.$id, name: target.name, email: target.email },
            ...existing
        ].slice(0, MAX_RECENTS);
        localStorage.setItem(key, JSON.stringify(updated));
    }

    let search = '';
    let results: Models.User<Record<string, string>>[] = [];
    let loading = false;
    let debounceTimer: ReturnType<typeof setTimeout>;
    let recents: RecentTarget[] = [];

    $: if (show) {
        recents = readRecents();
    }

    function debounce(fn: () => void, delay = 300) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(fn, delay);
    }

    async function fetchUsers(prefix: string) {
        if (!prefix.trim()) {
            results = [];
            return;
        }
        loading = true;
        try {
            const response = await sdk.forConsole.users.list({
                queries: [
                    Query.or([
                        Query.startsWith('name', prefix),
                        Query.startsWith('email', prefix),
                        Query.startsWith('phone', prefix),
                        Query.startsWith('$id', prefix)
                    ]),
                    Query.orderDesc('$createdAt'),
                    Query.limit(25),
                    Query.offset(0)
                ]
            });
            results = response.users;
        } catch {
            results = [];
        } finally {
            loading = false;
        }
    }

    $: debounce(() => fetchUsers(search));

    $: activeAccountId = $user?.$id;
    $: operatorId = readOperatorSnapshot()?.$id ?? null;
    $: impersonatingId = readImpersonationTargetUserId();

    function isDisabled(id: string): boolean {
        return id === activeAccountId || (!!operatorId && id === operatorId);
    }

    function disabledLabel(id: string): string {
        if (id === activeAccountId) return 'Current';
        if (operatorId && id === operatorId) return 'Operator';
        return '';
    }

    async function selectUser(target: { $id: string; name: string; email: string }) {
        if (isDisabled(target.$id)) return;

        const existingOperator = readOperatorSnapshot();
        const operator: OperatorSnapshot = existingOperator ?? {
            $id: $user.$id,
            name: $user.name,
            email: $user.email
        };

        const targetSnapshot: TargetSnapshot = {
            $id: target.$id,
            name: target.name,
            email: target.email
        };

        saveRecent(target);
        startImpersonation(targetSnapshot, operator);
        search = '';
        results = [];
        show = false;

        await invalidate(Dependencies.ACCOUNT);
        await invalidate(Dependencies.ORGANIZATIONS);
        await goto(base);
    }

    function displayName(u: { name: string; email: string; $id: string }): string {
        return u.name || u.email || u.$id;
    }

    $: listToShow = search.trim() ? results : [];
    $: showRecents = !search.trim() && recents.length > 0;
    $: showNoResults = !!search.trim() && !loading && results.length === 0;
</script>

<Modal size="s" title="Impersonate user" bind:open={show} hideFooter>
    <svelte:fragment slot="description">
        Matches the start of name, email, phone, or user ID. The Console runs with the selected
        account's access until you end impersonation.
    </svelte:fragment>

    <Layout.Stack gap="m">
        <!-- Search input -->
        <div class="search-wrap">
            <span class="search-icon-wrap">
                <Icon icon={IconSearch} size="s" />
            </span>
            <!-- svelte-ignore a11y_autofocus -->
            <input
                autofocus
                class="search-field"
                type="search"
                placeholder="Name, email, phone, or user ID..."
                bind:value={search} />
            {#if loading}
                <span class="search-end">
                    <Spinner size="s" />
                </span>
            {/if}
        </div>

        <!-- No results -->
        {#if showNoResults}
            <Typography.Text>No users found</Typography.Text>
        {/if}

        <!-- Search results or recents -->
        {#if showRecents}
            <Typography.Text variant="m-500">Recent</Typography.Text>
        {/if}

        {#each listToShow.length ? listToShow : showRecents ? recents : [] as item (item.$id)}
            {@const disabled = isDisabled(item.$id)}
            {@const label = disabledLabel(item.$id)}
            {@const active = item.$id === impersonatingId}
            <!-- svelte-ignore a11y_interactive_supports_focus -->
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <div
                role="button"
                class="user-item"
                class:is-disabled={disabled}
                on:click={() => selectUser(item)}>
                <AvatarInitials name={displayName(item)} size="m" />
                <div class="user-details">
                    <Typography.Text variant="m-500">{displayName(item)}</Typography.Text>
                    {#if item.email && item.email !== displayName(item)}
                        <Typography.Text>{item.email}</Typography.Text>
                    {/if}
                    <!-- ID copy row — clicks stop propagation so they don't trigger selectUser -->
                    <div class="id-row" role="presentation" on:click|stopPropagation>
                        <Copy value={item.$id} event="user_impersonate_id">
                            <Tag size="xs" variant="code">
                                <Icon size="s" icon={IconDuplicate} slot="start" />
                                {item.$id}
                            </Tag>
                        </Copy>
                    </div>
                </div>
                {#if label}
                    <span class="badge">{label}</span>
                {:else if active}
                    <span class="badge badge-active">Active</span>
                {/if}
            </div>
        {/each}
    </Layout.Stack>
</Modal>

<style>
    /* Search bar */
    .search-wrap {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        border: 1px solid hsl(var(--color-neutral-20));
        border-radius: var(--border-radius-s, 6px);
        padding-inline: 0.75rem;
        background: transparent;
    }

    :global(.theme-dark) .search-wrap {
        border-color: hsl(var(--color-neutral-70));
    }

    .search-icon-wrap {
        display: flex;
        flex-shrink: 0;
        color: hsl(var(--color-neutral-50));
    }

    .search-field {
        flex: 1;
        border: none;
        outline: none;
        background: transparent;
        padding-block: 0.625rem;
        font-size: var(--font-size-1, 0.875rem);
        color: inherit;
        min-width: 0;
    }

    .search-field::placeholder {
        color: hsl(var(--color-neutral-50));
    }

    /* Hide native clear button — we rely on the user clearing manually */
    .search-field::-webkit-search-cancel-button {
        -webkit-appearance: none;
    }

    .search-end {
        display: flex;
        flex-shrink: 0;
    }

    /* User item */
    .user-item {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        padding: 0.75rem;
        border-radius: var(--border-radius-m, 8px);
        border: 1px solid hsl(var(--color-neutral-10));
        cursor: pointer;
        transition: background 0.1s ease;
    }

    :global(.theme-dark) .user-item {
        border-color: hsl(var(--color-neutral-80));
    }

    .user-item:not(.is-disabled):hover {
        background: hsl(var(--color-neutral-5));
    }

    :global(.theme-dark) .user-item:not(.is-disabled):hover {
        background: hsl(var(--color-neutral-85));
    }

    .user-item.is-disabled {
        opacity: 0.45;
        cursor: default;
        pointer-events: none;
    }

    /* Re-enable pointer events on the ID copy row even when item is disabled
       so the user can still copy the ID if needed */
    .user-item.is-disabled .id-row {
        pointer-events: auto;
    }

    .user-details {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 0.1rem;
    }

    .id-row {
        margin-top: 0.25rem;
    }

    /* Badges */
    .badge {
        flex-shrink: 0;
        align-self: center;
        font-size: var(--font-size-0, 0.75rem);
        padding: 0.125rem 0.5rem;
        border-radius: 999px;
        background: hsl(var(--color-neutral-10));
        color: hsl(var(--color-neutral-60));
        white-space: nowrap;
    }

    :global(.theme-dark) .badge {
        background: hsl(var(--color-neutral-80));
        color: hsl(var(--color-neutral-40));
    }

    .badge-active {
        background: hsl(var(--color-success-10));
        color: hsl(var(--color-success-60));
    }

    :global(.theme-dark) .badge-active {
        background: hsl(var(--color-success-80));
        color: hsl(var(--color-success-30));
    }
</style>
