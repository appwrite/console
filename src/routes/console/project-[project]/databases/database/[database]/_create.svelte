<script lang="ts">
    import { page } from '$app/stores';

    import { Modal, InnerModal } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { Button, InputText, Form, FormList } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForProject } from '$lib/stores/sdk';
    import { createEventDispatcher } from 'svelte';

    export let showCreate = false;

    const databaseId = $page.params.database;
    const dispatch = createEventDispatcher();

    let name = '';
    let id: string = null;
    let showDropdown = false;

    const create = async () => {
        try {
            const collection = await sdkForProject.databases.createCollection(
                databaseId,
                id ? id : 'unique()',
                name,
                'collection',
                [],
                []
            );
            name = id = null;
            showCreate = false;
            dispatch('created', collection);
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
        <svelte:fragment slot="header">Create Collection</svelte:fragment>
        <FormList>
            <InputText
                id="name"
                label="Name"
                placeholder="Enter collection name"
                bind:value={name}
                autofocus
                required />

            {#if !showDropdown}
                <div>
                    <Pill button on:click={() => (showDropdown = !showDropdown)}
                        ><span class="icon-pencil" aria-hidden="true" /><span class="text">
                            Collection ID
                        </span></Pill>
                </div>
            {:else}
                <InnerModal bind:show={showDropdown}>
                    <svelte:fragment slot="title">Collection ID</svelte:fragment>
                    <p>
                        Enter a custom collection ID. Leave blank for a randomly generated
                        collection ID.
                    </p>
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
