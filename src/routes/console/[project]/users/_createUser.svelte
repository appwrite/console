<script lang="ts">
    import { Modal, Card } from '$lib/components';
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
            const user = await sdkForProject.users.create(id ? id : 'unique()', mail, pass, name);
            mail = pass = name = '';
            showCreate = false;
            dispatch('created', user);
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
        <svelte:fragment slot="header">Create User</svelte:fragment>
        <FormList>
            <InputText
                id="name"
                label="Name"
                placeholder="John Doe"
                autofocus={true}
                bind:value={name} />
            <InputEmail
                id="email"
                label="E-Mail"
                placeholder="test@example.com"
                required={true}
                bind:value={mail} />
            <InputPassword
                id="password"
                label="Password"
                placeholder="*****"
                required={true}
                bind:value={pass} />

            {#if !showDropdown}
                <div>
                    <Pill button on:click={() => (showDropdown = !showDropdown)}
                        >User ID <i class="icon-pencil" /></Pill>
                </div>
            {:else}
                <Card>
                    <header class="modal-header">
                        <h4 class="modal-title">User ID</h4>
                        <button
                            type="button"
                            class="x-button"
                            aria-label="Close Modal"
                            title="Close Modal"
                            on:click={() => (showDropdown = false)}>
                            <span class="icon-x" aria-hidden="true" />
                        </button>
                    </header>
                    <div class="modal-content">
                        <p>Enter a custom user ID. Leave blank for a randomly generated user ID.</p>
                    </div>
                    <div class="modal-footer">
                        <input
                            class="input-text"
                            type="text"
                            name="id"
                            id="id"
                            placeholder="Enter ID"
                            bind:value={id} />
                        <div class="u-flex u-gap-12">
                            <div class="icon-info u-block" />
                            <p>
                                Allowed characters: alphanumeric, hyphen, non-leading underscore,
                                period
                            </p>
                        </div>
                    </div>
                </Card>
            {/if}
        </FormList>
        <svelte:fragment slot="footer">
            <Button text on:click={() => (showCreate = false)}>Cancel</Button>
            <Button submit>Create</Button>
        </svelte:fragment>
    </Modal>
</Form>
