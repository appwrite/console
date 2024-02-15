<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid, Heading, Empty } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, FormList, InputChoice } from '$lib/elements/forms';
    import {
        Table,
        TableBody,
        TableCell,
        TableCellHead,
        TableCellText,
        TableHeader,
        TableRow
    } from '$lib/elements/table';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { user } from '$lib/stores/user';
    import Mfa from './mfa.svelte';
    import DeleteMfa from './deleteMfa.svelte';
    import { factors } from './store';

    let showSetup: boolean = false;
    let showDelete: boolean = false;

    async function updateMfa() {
        try {
            await sdk.forConsole.account.updateMFA(!$user.mfa);
            await invalidate(Dependencies.ACCOUNT);
            trackEvent(Submit.AccountUpdateEmail);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.AccountUpdateEmail);
        }
    }
</script>

<CardGrid>
    <Heading tag="h6" size="7">Multi-factor authentication</Heading>

    <svelte:fragment slot="aside">
        <FormList>
            <InputChoice
                on:change={updateMfa}
                type="switchbox"
                id="mfa"
                label="Multi-factor authentication"
                value={$user.mfa} />
        </FormList>
        <p>Enhance the security of your account by adding authentication factors.</p>
        {#if $user.mfa}
            {#if $factors.totp}
                <Table noMargin noStyles transparent>
                    <TableHeader>
                        <TableCellHead>Authenticator</TableCellHead>
                        <TableCellHead width={40} />
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCellText title="Authenticator">
                                TOTP (One-time code)
                            </TableCellText>
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
                <Empty on:click={() => (showSetup = true)}>
                    <p class="text">Add authentication factor</p>
                </Empty>
            {/if}
        {/if}
    </svelte:fragment>
</CardGrid>

<Mfa bind:showSetup />
<DeleteMfa bind:showDelete />
