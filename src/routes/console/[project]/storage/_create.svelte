<script lang="ts">
    import { Modal, CardDrop } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { Button, InputText, Form, FormList } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';

    import { sdkForProject } from '$lib/stores/sdk';
    import { createEventDispatcher } from 'svelte';

    export let showCreate = false;

    const dispatch = createEventDispatcher();

    let name = '';
    let id: string = null;
    let showDropdown = false;

    const create = async () => {
        try {
            const bucket = await sdkForProject.storage.createBucket(
                id ? id : 'unique()',
                name,
                'bucket'
            );
            name = null;
            showCreate = false;
            dispatch('created', bucket);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    };
</script>

<Form on:submit={create}>
    <Modal size="big" bind:show={showCreate}>
        <svelte:fragment slot="header">Create Bucket</svelte:fragment>
        <FormList>
            <InputText
                id="name"
                label="Name"
                placeholder="New Bucket"
                bind:value={name}
                autofocus
                required />

            {#if !showDropdown}
                <div>
                    <Pill button on:click={() => (showDropdown = !showDropdown)}
                        >Bucket ID <i class="icon-pencil" /></Pill>
                </div>
            {:else}
                <CardDrop bind:show={showDropdown}>
                    <svelte:fragment slot="header">Bucket ID</svelte:fragment>
                    <p>Enter a custom bucket ID. Leave blank for a randomly generated bucket ID.</p>
                    <svelte:fragment slot="footer">
                        <input
                            class="input-text "
                            type="text"
                            name="id"
                            id="id"
                            placeholder="Enter ID"
                            bind:value={id} />
                        <div class="u-flex u-gap-12">
                            <div class="icon-info u-block" />
                            <p class="u-small">
                                Allowed characters: alphanumeric, hyphen, non-leading underscore,
                                period
                            </p>
                        </div>
                    </svelte:fragment>
                </CardDrop>
            {/if}
        </FormList>
        <svelte:fragment slot="footer">
            <Button submit>Create</Button>
            <Button secondary on:click={() => (showCreate = false)}>Cancel</Button>
        </svelte:fragment>
    </Modal>
</Form>
