<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Layout, Selector, Input, Badge } from '@appwrite.io/pink-svelte';
    import { project } from '../../store';
    import { tick } from 'svelte';

    let value = $project?.authLimit !== 0 ? 'limited' : 'unlimited';

    $: isLimited = value === 'limited';
    let newLimit = isLimited ? $project?.authLimit : 100;

    $: btnDisabled = (function isBtnDisabled() {
        if (
            (!isLimited && $project?.authLimit === 0) ||
            (isLimited && $project?.authLimit === newLimit)
        ) {
            return true;
        }

        return false;
    })();

    async function updateLimit() {
        try {
            await sdk.forConsole.projects.updateAuthLimit($project?.$id, isLimited ? newLimit : 0);
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

    let maxUsersInputField: HTMLInputElement | null = null;

    $: if (isLimited && maxUsersInputField) {
        tick().then(() => {
            maxUsersInputField.focus();
        });
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
                    max="10000"
                    disabled={!isLimited}
                    bind:value={newLimit} />
            </Layout.Stack>
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
