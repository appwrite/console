<script lang="ts">
    import { Modal, InnerModal } from '$lib/components';
    import { Pill } from '$lib/elements/';
    import {
        Button,
        InputPassword,
        InputEmail,
        InputText,
        Form,
        FormList
    } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForProject } from '$lib/stores/sdk';
    import { createEventDispatcher } from 'svelte';

    export let showCreate = false;

    const dispatch = createEventDispatcher();

    let showDropdown = false;
    let name: string, mail: string, pass: string, id: string;

    const create = async () => {
        try {
            const user = await sdkForProject.users.create(id ?? 'unique()', mail, pass, name);
            mail = pass = name = '';
            showCreate = false;
            showDropdown = false;
            dispatch('created', user);
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
        <svelte:fragment slot="header">Create User</svelte:fragment>
        <FormList>
            <InputText
                id="name"
                label="Name"
                placeholder="Enter name"
                autofocus={true}
                bind:value={name} />
            <InputEmail
                id="email"
                label="Email"
                placeholder="Enter email"
                required={true}
                bind:value={mail} />
            <InputPassword
                id="password"
                label="Password"
                placeholder="Enter password"
                required={true}
                bind:value={pass} />

            {#if !showDropdown}
                <div>
                    <Pill button on:click={() => (showDropdown = !showDropdown)}
                        ><span class="icon-pencil" aria-hidden="true" /><span class="text">
                            User ID
                        </span></Pill>
                </div>
            {:else}
                <InnerModal bind:show={showDropdown}>
                    <svelte:fragment slot="title">User ID</svelte:fragment>
                    Enter a custom user ID. Leave blank for a randomly generated user ID.
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
            <Button text on:click={() => (showCreate = false)}>Cancel</Button>
            <Button submit>Create</Button>
        </svelte:fragment>
    </Modal>
</Form>
