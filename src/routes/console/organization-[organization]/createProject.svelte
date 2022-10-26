<script lang="ts">
    import { Modal, CustomId } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { InputText, Button, Form, FormList } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { createEventDispatcher } from 'svelte';

    export let show = false;
    export let teamId: string;

    const dispatch = createEventDispatcher();

    let id: string;
    let name: string;
    let showCustomId = false;
    let error: string;

    const create = async () => {
        try {
            const project = await sdkForConsole.projects.create(id ?? 'unique()', name, teamId);
            dispatch('created', project);
            addNotification({
                type: 'success',
                message: `${name} has been created`
            });
            id = name = null;
            showCustomId = false;
            show = false;
        } catch ({ message }) {
            error = message;
        }
    };
</script>

<Form on:submit={create}>
    <Modal {error} size="big" bind:show>
        <svelte:fragment slot="header">Create Project</svelte:fragment>
        <FormList>
            <InputText id="name" label="Name" bind:value={name} required autofocus={true} />
            {#if !showCustomId}
                <div>
                    <Pill button on:click={() => (showCustomId = !showCustomId)}>
                        <span class="icon-pencil" aria-hidden="true" /><span class="text">
                            Project ID
                        </span>
                    </Pill>
                </div>
            {:else}
                <CustomId bind:show={showCustomId} name="Project" bind:id />
            {/if}
        </FormList>
        <svelte:fragment slot="footer">
            <Button secondary on:click={() => (show = false)}>Cancel</Button>
            <Button submit>Create</Button>
        </svelte:fragment>
    </Modal>
</Form>
