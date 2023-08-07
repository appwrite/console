<script lang="ts">
    import { page } from '$app/stores';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';

    import { Modal, CustomId } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { Button, InputText, FormList } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { ID } from '@appwrite.io/console';
    import { createEventDispatcher } from 'svelte';
    import LL from '$i18n/i18n-svelte';

    export let showCreate = false;

    const databaseId = $page.params.database;
    const dispatch = createEventDispatcher();

    let name = '';
    let id: string = null;
    let showCustomId = true;

    const create = async () => {
        try {
            const collection = await sdk.forProject.databases.createCollection(
                databaseId,
                id ? id : ID.unique(),
                name
            );
            showCreate = false;
            dispatch('created', collection);
            addNotification({
                type: 'success',
                message: `${name} ${$LL.components.notification.hasBeenCreated()}`
            });
            name = id = null;
            trackEvent(Submit.CollectionCreate, {
                customId: !!id
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.CollectionCreate);
        }
    };
</script>

<Modal size="big" bind:show={showCreate} onSubmit={create}>
    <svelte:fragment slot="header">{$LL.console.project.title.createCollection()}</svelte:fragment>
    <FormList>
        <InputText
            id="name"
            label={$LL.console.project.forms.databases.createCollection.inputs.name.label()}
            placeholder={$LL.console.project.forms.databases.createCollection.inputs.name.placeholder()}
            bind:value={name}
            autofocus
            required />

        {#if !showCustomId}
            <div>
                <Pill button on:click={() => (showCustomId = !showCustomId)}
                    ><span class="icon-pencil" aria-hidden="true" /><span class="text">
                        {$LL.console.project.table.pill.collectionId()}
                    </span></Pill>
            </div>
        {:else}
            <CustomId bind:show={showCustomId} name="Collection" bind:id autofocus={false} />
        {/if}
    </FormList>
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (showCreate = false)}
            >{$LL.console.project.button.cancel()}</Button>
        <Button submit>{$LL.console.project.button.submit.create()}</Button>
    </svelte:fragment>
</Modal>
