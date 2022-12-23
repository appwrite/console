<script lang="ts">
    import { Modal, CustomId } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { Button, InputText, FormList } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForProject } from '$lib/stores/sdk';
    import { createEventDispatcher } from 'svelte';

    export let showCreate = false;

    const dispatch = createEventDispatcher();

    let name = '';
    let id: string | null = null;
    let showCustomId = false;

    const create = async () => {
        try {
            const database = await sdkForProject.databases.create(id ? id : 'unique()', name);
            showCreate = false;
            dispatch('created', database);
            addNotification({
                type: 'success',
                message: `${name} has been created`
            });
            name = '';
            id = null;
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    };
</script>

<Modal size="big" on:submit={create} bind:show={showCreate}>
    <svelte:fragment slot="header">Create Database</svelte:fragment>
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
            <CustomId bind:show={showCustomId} name="Database" bind:id />
        {/if}
    </FormList>
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (showCreate = false)}>Cancel</Button>
        <Button submit>Create</Button>
    </svelte:fragment>
</Modal>
