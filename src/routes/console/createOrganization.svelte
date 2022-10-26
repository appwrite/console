<script lang="ts">
    import { Modal, CustomId } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { InputText, Button, Form, FormList } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { createEventDispatcher } from 'svelte';
    import { goto, invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';

    export let show = false;
    export let closable = true;
    const dispatch = createEventDispatcher();

    let name: string;
    let id: string;
    let showCustomId = false;
    let error: string;

    const create = async () => {
        try {
            const org = await sdkForConsole.teams.create(id ?? 'unique()', name);
            await invalidate(Dependencies.ACCOUNT);
            dispatch('created');
            await goto(`/console/organization-${org.$id}`);
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
