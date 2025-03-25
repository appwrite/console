<script lang="ts">
    import { page } from '$app/stores';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal, CustomId } from '$lib/components';
    import { Pill } from '$lib/elements/';
    import {
        Button,
        InputPassword,
        InputEmail,
        InputText,
        InputPhone,
        FormList
    } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { ID } from '@appwrite.io/console';
    import { createEventDispatcher } from 'svelte';

    export let showCreate = false;

    const dispatch = createEventDispatcher();

    let showDropdown = false;
    let name: string, mail: string, pass: string, id: string, phone: string;
    let error: string;

    const create = async () => {
        try {
            const user = await sdk
                .forProject($page.params.region, $page.params.project)
                .users.create(
                    id ?? ID.unique(),
                    mail || undefined,
                    phone || undefined,
                    pass || undefined,
                    name || undefined
                );
            mail = pass = name = '';
            showCreate = false;
            showDropdown = false;
            addNotification({
                type: 'success',
                message: `${user.name ? user.name : 'User'} has been created`
            });
            trackEvent(Submit.UserCreate, {
                customId: !!id
            });
            dispatch('created', user);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.UserCreate);
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

<Modal title="Create user" {error} size="big" bind:show={showCreate} onSubmit={create}>
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
            <CustomId autofocus bind:show={showDropdown} name="User" bind:id />
        {/if}
    </FormList>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showCreate = false)}>Cancel</Button>
        <Button submit>Create</Button>
    </svelte:fragment>
</Modal>
