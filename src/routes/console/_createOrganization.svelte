<script lang="ts">
    import { Modal, InnerModal } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { InputText, Button, Form, FormList } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { createEventDispatcher } from 'svelte';
    import { organization, organizationList } from './store';
    import { titleDropdown } from '$lib/stores/layout';
    import { goto } from '$app/navigation';

    export let show = false;

    const dispatch = createEventDispatcher();

    let name: string;
    let id: string;
    let showDropdown = false;
    let error: string;

    const create = async () => {
        try {
            const team = await sdkForConsole.teams.create(id ?? 'unique()', name);
            dispatch('created');
            await organizationList.load();
            titleDropdown.set($organizationList.teams);
            organization.set(team);
            goto('/console');
            addNotification({
                type: 'success',
                message: `${name} has been created`
            });
            name = null;
            id = null;
            show = false;
        } catch ({ message }) {
            error = message;
        }
    };
</script>

<Form on:submit={create}>
    <Modal {error} size="big" bind:show>
        <svelte:fragment slot="header">Create New Organization</svelte:fragment>
        <FormList>
            <InputText
                id="name"
                label="Name"
                placeholder="Enter name"
                bind:value={name}
                autofocus={true}
                required />
            {#if !showDropdown}
                <div>
                    <Pill button on:click={() => (showDropdown = !showDropdown)}>
                        <span class="icon-pencil" aria-hidden="true" /><span class="text">
                            Organization ID
                        </span>
                    </Pill>
                </div>
            {:else}
                <InnerModal bind:show={showDropdown}>
                    <svelte:fragment slot="title">Organization ID</svelte:fragment>
                    <svelte:fragment slot="subtitle">
                        Enter a custom organization ID. Leave blank for a randomly generated one.
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
