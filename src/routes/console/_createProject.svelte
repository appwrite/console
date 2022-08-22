<script lang="ts">
    import { Modal, InnerModal } from '$lib/components';
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
    let showDropdown = false;
    let error: string;

    const create = async () => {
        try {
            const project = await sdkForConsole.projects.create(id ?? 'unique()', name, teamId);
            id = name = null;
            dispatch('created', project);
            addNotification({
                type: 'success',
                message: `${name} has been created`
            });
        } catch ({ message }) {
            error = message;
        }
    };
</script>

<Form on:submit={create}>
    <Modal {error} size="big" bind:show>
        <svelte:fragment slot="header">Create Project</svelte:fragment>
        <FormList>
            <InputText id="name" label="Name" bind:value={name} required />
            {#if !showDropdown}
                <div>
                    <Pill button on:click={() => (showDropdown = !showDropdown)}>
                        <span class="icon-pencil" aria-hidden="true" /><span class="text">
                            Project ID
                        </span>
                    </Pill>
                </div>
            {:else}
                <InnerModal bind:show={showDropdown}>
                    <svelte:fragment slot="title">Project ID</svelte:fragment>
                    <svelte:fragment slot="subtitle">
                        Enter a custom project ID. Leave blank for a randomly generated one.
                    </svelte:fragment>
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
                                <span class="text u-line-height-1-5">
                                    Allowed characters: alphanumeric, hyphen, non-leading
                                    underscore, period
                                </span>
                            </div>
                        </div>
                    </svelte:fragment>
                </InnerModal>
            {/if}
        </FormList>
        <svelte:fragment slot="footer">
            <Button secondary on:click={() => (show = false)}>Cancel</Button>
            <Button submit>Create</Button>
        </svelte:fragment>
    </Modal>
</Form>
