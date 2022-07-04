<script lang="ts">
    import { Modal, CardDrop } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { InputText, Button, Form, FormList } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForProject } from '$lib/stores/sdk';
    import { createEventDispatcher } from 'svelte';

    export let showCreate = false;

    const dispatch = createEventDispatcher();

    let name: string, id: string;
    let showDropdown = false;

    const create = async () => {
        try {
            const team = await sdkForProject.teams.create(id ?? 'unique()', name);
            name = '';
            showCreate = false;
            showDropdown = false;
            dispatch('created', team);
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
</script>

<Form on:submit={create}>
    <Modal size="big" bind:show={showCreate}>
        <svelte:fragment slot="header">Create Team</svelte:fragment>
        <FormList>
            <InputText
                id="name"
                label="Name"
                placeholder="John Doe"
                autofocus={true}
                bind:value={name} />
            {#if !showDropdown}
                <div>
                    <Pill button on:click={() => (showDropdown = !showDropdown)}
                        >Team ID <i class="icon-pencil" /></Pill>
                </div>
            {:else}
                <CardDrop bind:show={showDropdown}>
                    <svelte:fragment slot="header">Team ID</svelte:fragment>
                    <p>Enter a custom team ID. Leave blank for a randomly generated team ID.</p>
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
            <Button secondary on:click={() => (showCreate = false)}>Cancel</Button>
            <Button submit>Create</Button>
        </svelte:fragment>
    </Modal>
</Form>
