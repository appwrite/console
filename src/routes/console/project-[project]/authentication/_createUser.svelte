<script lang="ts">
    import { Modal, InnerModal } from '$lib/components';
    import { Pill } from '$lib/elements/';
    import {
        Button,
        InputPassword,
        InputEmail,
        InputText,
        InputPhone,
        Form,
        FormList
    } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForProject } from '$lib/stores/sdk';
    import { createEventDispatcher } from 'svelte';

    export let showCreate = false;

    const dispatch = createEventDispatcher();

    let showDropdown = false;
    let name: string, mail: string, pass: string, id: string, phone: string;
    let error: string;

    const create = async () => {
        try {
            const user = await sdkForProject.users.create(
                id ?? 'unique()',
                mail,
                phone,
                pass,
                name
            );
            mail = pass = name = '';
            showCreate = false;
            showDropdown = false;
            addNotification({
                type: 'success',
                message: `${user.name ?? 'User'} has been created`
            });
            dispatch('created', user);
        } catch ({ message }) {
            error = message;
        }
    };

    $: if (!showDropdown) {
        id = null;
    }
    $: if (!showCreate) {
        showDropdown = false;
        error = null;
    }
</script>

<Form on:submit={create}>
    <Modal {error} size="big" bind:show={showCreate}>
        <svelte:fragment slot="header">Create User</svelte:fragment>
        <FormList>
            <InputText
                id="name"
                label="Name"
                placeholder="Enter name"
                autofocus={true}
                bind:value={name} />
            <InputEmail id="email" label="Email" placeholder="Enter email" bind:value={mail} />
            <InputPhone id="phone" label="Phone" placeholder="Enter phone" bind:value={phone} />
            <InputPassword
                id="password"
                label="Password"
                placeholder="Enter password"
                showPasswordButton={true}
                bind:value={pass} />

            {#if !showDropdown}
                <div>
                    <Pill button on:click={() => (showDropdown = !showDropdown)}>
                        <span class="icon-pencil" aria-hidden="true" /><span class="text">
                            User ID
                        </span>
                    </Pill>
                </div>
            {:else}
                <InnerModal bind:show={showDropdown}>
                    <svelte:fragment slot="title">User ID</svelte:fragment>
                    <svelte:fragment slot="subtitle">
                        Enter a custom user ID. Leave blank for a randomly generated one.
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
            <Button text on:click={() => (showCreate = false)}>Cancel</Button>
            <Button submit>Create</Button>
        </svelte:fragment>
    </Modal>
</Form>
