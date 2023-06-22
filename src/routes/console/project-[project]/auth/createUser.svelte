<script lang="ts">
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
    import LL from '$i18n/i18n-svelte';

    export let showCreate = false;

    const dispatch = createEventDispatcher();

    let showDropdown = false;
    let name: string, mail: string, pass: string, id: string, phone: string;
    let error: string;

    const create = async () => {
        try {
            const user = await sdk.forProject.users.create(
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

<Modal {error} size="big" bind:show={showCreate} onSubmit={create}>
    <svelte:fragment slot="header">{$LL.console.title.createUser()}</svelte:fragment>
    <FormList>
        <InputText
            id="name"
            label={$LL.console.forms.createUser.inputs.name.label()}
            placeholder={$LL.console.forms.createUser.inputs.name.placeholder()}
            autofocus={true}
            bind:value={name} />
        <InputEmail
            id="email"
            label={$LL.console.forms.createUser.inputs.email.label()}
            placeholder={$LL.console.forms.createUser.inputs.email.placeholder()}
            bind:value={mail} />
        <InputPhone
            id="phone"
            label={$LL.console.forms.createUser.inputs.phone.label()}
            placeholder={$LL.console.forms.createUser.inputs.phone.placeholder()}
            bind:value={phone} />
        <InputPassword
            id="password"
            label={$LL.console.forms.createUser.inputs.password.label()}
            placeholder={$LL.console.forms.createUser.inputs.password.placeholder()}
            showPasswordButton={true}
            bind:value={pass} />

        {#if !showDropdown}
            <div>
                <Pill button on:click={() => (showDropdown = !showDropdown)}>
                    <span class="icon-pencil" aria-hidden="true" /><span class="text">
                        {$LL.console.button.pill.userId()}
                    </span>
                </Pill>
            </div>
        {:else}
            <CustomId bind:show={showDropdown} name="User" bind:id />
        {/if}
    </FormList>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showCreate = false)}>{$LL.console.button.cancel()}</Button>
        <Button submit>{$LL.console.button.submit.create()}</Button>
    </svelte:fragment>
</Modal>
