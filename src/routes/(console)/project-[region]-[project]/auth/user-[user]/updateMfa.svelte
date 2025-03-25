<script lang="ts">
    import { CardGrid, Heading } from '$lib/components';
    import EmptySearch from '$lib/components/emptySearch.svelte';
    import { Form, Button, FormList, InputChoice } from '$lib/elements/forms';
    import {
        Table,
        TableBody,
        TableCell,
        TableCellHead,
        TableCellText,
        TableHeader,
        TableRow
    } from '$lib/elements/table';
    import { onMount } from 'svelte';
    import DeleteMfa from './deleteMfa.svelte';
    import { userFactors } from './store';
    import { user } from './store';
    import { sdk } from '$lib/stores/sdk';
    import { invalidate } from '$app/navigation';
    import { addNotification } from '$lib/stores/notifications';
    import { Dependencies } from '$lib/constants';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { page } from '$app/stores';

    let showDelete = false;
    let userMfa: boolean = null;

    onMount(async () => {
        userMfa ??= $user.mfa;
    });

    async function updateMfa() {
        try {
            await sdk
                .forProject($page.params.region, $page.params.project)
                .users.updateMfa($user.$id, userMfa);
            await invalidate(Dependencies.USER);
            addNotification({
                message: `Multi-factor authentication has been ${userMfa ? 'enabled' : 'disabled'}`,
                type: 'success'
            });
            trackEvent(Submit.UserUpdateEmail);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.UserUpdateEmail);
        }
    }
</script>

<Form onSubmit={updateMfa}>
    <CardGrid>
        <Heading tag="h6" size="7">Multi-factor authentication</Heading>
        <p class="text">MFA allows users to enhance the security of their accounts in your app.</p>
        <svelte:fragment slot="aside">
            <FormList>
                <InputChoice
                    type="switchbox"
                    id="mfa"
                    label="Multi-factor authentication"
                    bind:value={userMfa} />
            </FormList>
            {#if $userFactors.totp}
                <Table noMargin noStyles transparent>
                    <TableHeader>
                        <TableCellHead>Authenticator</TableCellHead>
                        <TableCellHead width={40} />
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCellText title="Authenticator"
                                >TOTP (One-time code)</TableCellText>
                            <TableCell>
                                <Button
                                    on:click={() => (showDelete = true)}
                                    round
                                    text
                                    ariaLabel="Delete authenticator">
                                    <span class="icon-trash" aria-hidden="true" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
                <Button disabled text noMargin>
                    <span class="icon-plus" />
                    <span class="text">Add authentication factor</span>
                </Button>
            {:else}
                <EmptySearch hidePagination hidePages>
                    <p class="text u-text-center">
                        No authenticators have been enabled.<br />Once the user adds an
                        authenticator, you'll see it here.
                    </p>
                </EmptySearch>
            {/if}
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={userMfa === $user.mfa} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>

<DeleteMfa bind:showDelete />
