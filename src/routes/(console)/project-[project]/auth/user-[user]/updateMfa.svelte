<script lang="ts">
    import { CardGrid } from '$lib/components';
    import { Form, Button, InputChoice } from '$lib/elements/forms';
    import { onMount } from 'svelte';
    import DeleteMfa from './deleteMfa.svelte';
    import { userFactors } from './store';
    import { user } from './store';
    import { sdk } from '$lib/stores/sdk';
    import { invalidate } from '$app/navigation';
    import { addNotification } from '$lib/stores/notifications';
    import { Dependencies } from '$lib/constants';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Card, Empty, Table } from '@appwrite.io/pink-svelte';

    let showDelete = false;
    let userMfa: boolean = null;

    onMount(async () => {
        userMfa ??= $user.mfa;
    });

    async function updateMfa() {
        try {
            await sdk.forProject.users.updateMfa($user.$id, userMfa);
            await invalidate(Dependencies.USER);
            addNotification({
                message: `Multi-factor authentication has been ${userMfa ? 'enabled' : 'disabled'}`,
                type: 'success'
            });
            trackEvent(Submit.UserUpdateMfa);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.UserUpdateMfa);
        }
    }
</script>

<Form onSubmit={updateMfa}>
    <CardGrid>
        <svelte:fragment slot="title">Multi-factor authentication</svelte:fragment>
        MFA allows users to enhance the security of their accounts in your app.
        <svelte:fragment slot="aside">
            <InputChoice
                type="switchbox"
                id="mfa"
                label="Multi-factor authentication"
                bind:value={userMfa} />
            {#if $userFactors.totp}
                <Table.Root columns={[{ id: 'type' }, { id: 'actions', width: 40 }]} let:root>
                    <svelte:fragment slot="header" let:root>
                        <Table.Header.Cell column="type" {root}>Authenticator</Table.Header.Cell>
                        <Table.Header.Cell column="actions" {root} />
                    </svelte:fragment>
                    <Table.Row.Base {root}>
                        <Table.Cell column="type" {root}>TOTP (One-time code)</Table.Cell>
                        <Table.Cell column="actions" {root}>
                            <Button
                                on:click={() => (showDelete = true)}
                                icon
                                text
                                ariaLabel="Delete authenticator">
                                <span class="icon-trash" aria-hidden="true"></span>
                            </Button>
                        </Table.Cell>
                    </Table.Row.Base>
                </Table.Root>
            {:else}
                <Card.Base variant="primary">
                    <Empty
                        type="secondary"
                        title="No authenticators have been enabled."
                        description="Once the user adds an authenticator, you'll see it here." />
                </Card.Base>
            {/if}
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={userMfa === $user.mfa} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>

<DeleteMfa bind:showDelete />
