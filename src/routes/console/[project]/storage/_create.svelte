<script lang="ts">
    import { Modal, InnerModal } from '$lib/components';
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

    $: if (!showDropdown) {
        id = null;
    }
    $: if (!showCreate) {
        showDropdown = false;
    }
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
                        ><span class="icon-pencil" aria-hidden="true" /><span class="text">
                            Bucket ID
                        </span></Pill>
                </div>
            {:else}
                <InnerModal bind:show={showDropdown}>
                    <svelte:fragment slot="title">Bucket ID</svelte:fragment>
                    <p>Enter a custom bucket ID. Leave blank for a randomly generated bucket ID.</p>
                    <svelte:fragment slot="content">
                        <div class="form">
                            <InputText
                                id="id"
                                label="Custom ID"
                                showLabel={false}
                                placeholder="Enter ID"
                                autofocus={true}
                                bind:value={id} />

                            <div class="u-flex u-gap-4 u-margin-block-start-8 u-small">
                                <span
                                    class="icon-info u-cross-center u-margin-block-start-2 u-line-height-1 u-icon-small"
                                    aria-hidden="true" />
                                <span class="text u-line-height-1-5"
                                    >Allowed characters: alphanumeric, hyphen, non-leading
                                    underscore, period</span>
                            </div>
                        </div>
                    </svelte:fragment>
                </InnerModal>
            {/if}
        </FormList>
        <svelte:fragment slot="footer">
            <Button secondary on:click={() => (showCreate = false)}>Cancel</Button>
            <Button submit>Create</Button>
        </svelte:fragment>
    </Modal>
</Form>
