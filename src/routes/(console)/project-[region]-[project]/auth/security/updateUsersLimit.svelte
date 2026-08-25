<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Layout, Selector, Input, Badge } from '@appwrite.io/pink-svelte';
    import type { Models } from '@appwrite.io/console';
    import {
        USERS_LIMIT_MAX,
        USERS_LIMIT_MIN,
        usersLimitChanged,
        usersLimitError,
        type UsersLimitMode
    } from './usersLimit';

    let {
        project,
        policy
    }: {
        project: Models.Project;
        policy: Models.PolicyUserLimit;
    } = $props();

    let value = $state<UsersLimitMode>(policy.total !== 0 ? 'limited' : 'unlimited');
    let newLimit = $state(policy.total !== 0 ? policy.total : 100);

    const isLimited = $derived(value === 'limited');
    const limitError = $derived(isLimited ? usersLimitError(newLimit) : null);
    const btnDisabled = $derived(!!limitError || !usersLimitChanged(value, newLimit, policy.total));

    async function updateLimit() {
        try {
            await sdk.forProject(project.region, project.$id).project.updateUserLimitPolicy({
                total: isLimited ? newLimit : null
            });
            await invalidate(Dependencies.PROJECT);
            addNotification({
                type: 'success',
                message: 'Updated project users limit successfully'
            });
            trackEvent(Submit.AuthLimitUpdate);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.AuthLimitUpdate);
        }
    }
</script>

<CardGrid>
    <svelte:fragment slot="title">Users limit</svelte:fragment>
    Limit new users from signing up for your project, regardless of authentication method. You can still
    create users and team memberships from your Appwrite console.
    <svelte:fragment slot="aside">
        <Layout.Stack>
            <Layout.Stack direction="row" alignItems="center">
                <Selector.Radio
                    bind:group={value}
                    name="authLimit"
                    id="unlimited"
                    label="Unlimited"
                    value="unlimited" />
                <Badge variant="secondary" content="Recommended" />
            </Layout.Stack>
            <Layout.Stack direction="row" alignItems="center">
                <Selector.Radio
                    bind:group={value}
                    name="authLimit"
                    id="limited"
                    label="Limited"
                    value="limited" />
                <Input.Number
                    name="limit"
                    id="limit"
                    class="input-text"
                    min={USERS_LIMIT_MIN}
                    max={USERS_LIMIT_MAX}
                    step={1}
                    state={limitError ? 'error' : 'default'}
                    disabled={!isLimited}
                    bind:value={newLimit} />
            </Layout.Stack>
            {#if limitError}
                <Input.Helper state="error">{limitError}</Input.Helper>
            {/if}
        </Layout.Stack>
    </svelte:fragment>

    <svelte:fragment slot="actions">
        <Button
            disabled={btnDisabled}
            on:click={() => {
                updateLimit();
            }}>Update</Button>
    </svelte:fragment>
</CardGrid>
