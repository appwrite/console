<script lang="ts">
    import { Modal, CustomId } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { InputText, Button, Form, FormList } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { createEventDispatcher } from 'svelte';
    import { organization, organizationList } from '$lib/stores/organization';
    import { titleDropdown } from '$lib/stores/layout';
    import { goto } from '$app/navigation';

    export let show = false;
    export let closable = true;
    const dispatch = createEventDispatcher();

    let name: string;
    let id: string;
    let showCustomId = false;
    let error: string;

    const create = async () => {
        try {
            const team = await sdkForConsole.teams.create(id ?? 'unique()', name);
            dispatch('created');
            await organizationList.load();
            titleDropdown.set($organizationList.teams);
            organization.set(team);
            await goto(`/console/organization-${$organization.$id}`);
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
    <Modal {error} size="big" bind:show {closable}>
        <svelte:fragment slot="header">Create New Organization</svelte:fragment>
        <FormList>
            <InputText
                id="name"
                label="Name"
                placeholder="Enter name"
                bind:value={name}
                autofocus={true}
                required />
            {#if !showCustomId}
                <div>
                    <Pill button on:click={() => (showCustomId = !showCustomId)}>
                        <span class="icon-pencil" aria-hidden="true" /><span class="text">
                            Organization ID
                        </span>
                    </Pill>
                </div>
            {:else}
                <CustomId bind:show={showCustomId} name="organization" bind:id />
            {/if}
        </FormList>
        <svelte:fragment slot="footer">
            <Button disabled={!closable} secondary on:click={() => (show = false)}>Cancel</Button>
            <Button submit>Create</Button>
        </svelte:fragment>
    </Modal>
</Form>
