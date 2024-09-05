<script lang="ts">
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal, CustomId, Alert } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { Button, InputText, FormList } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { ID } from '@appwrite.io/console';
    import { createEventDispatcher } from 'svelte';
    import { isCloud } from '$lib/system';
    import { BillingPlan } from '$lib/constants';
    import { organization } from '$lib/stores/organization';
    import { upgradeURL } from '$lib/stores/billing';

    export let showCreate = false;

    const dispatch = createEventDispatcher();

    let name = '';
    let id: string = null;
    let showCustomId = false;
    let showPlanUpgradeAlert = true;

    const create = async () => {
        try {
            const database = await sdk.forProject.databases.create(id ? id : ID.unique(), name);
            showCreate = false;
            dispatch('created', database);
            addNotification({
                type: 'success',
                message: `${name} has been created`
            });
            trackEvent(Submit.DatabaseCreate, {
                customId: !!id
            });
            name = id = null;
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.DatabaseCreate);
        }
    };

    $: if (!showCreate) {
        showPlanUpgradeAlert = true;
    }
</script>

<Modal title="Create database" size="big" onSubmit={create} bind:show={showCreate}>
    <FormList>
        <InputText
            id="name"
            label="Name"
            placeholder="Enter database name"
            bind:value={name}
            autofocus
            required />

        {#if !showCustomId}
            <div>
                <Pill button on:click={() => (showCustomId = !showCustomId)}
                    ><span class="icon-pencil" aria-hidden="true" /><span class="text">
                        Database ID
                    </span></Pill>
            </div>
        {:else}
            <CustomId bind:show={showCustomId} name="Database" bind:id autofocus={false} />
        {/if}

        {#if isCloud && $organization?.billingPlan === BillingPlan.FREE}
            {#if showPlanUpgradeAlert}
                <Alert type="warning" dismissible on:dismiss={() => (showPlanUpgradeAlert = false)}>
                    <svelte:fragment slot="title">This database won't be backed up</svelte:fragment>
                    Upgrade your plan to manage database backup policies
                    <svelte:fragment slot="buttons">
                        <Button href={$upgradeURL} text>Upgrade plan</Button>
                    </svelte:fragment>
                </Alert>
            {/if}
        {:else}
            Backup Policies Tabs here
        {/if}
    </FormList>
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (showCreate = false)}>Cancel</Button>
        <Button submit>Create</Button>
    </svelte:fragment>
</Modal>
