<script lang="ts">
    import LL from '$i18n/i18n-svelte';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal, CustomId } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { Button, InputText, FormList } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { ID } from '@appwrite.io/console';
    import { createEventDispatcher } from 'svelte';

    export let showCreate = false;

    const dispatch = createEventDispatcher();

    let name = '';
    let id: string = null;
    let showCustomId = false;
    let error: string;

    const create = async () => {
        try {
            const bucket = await sdk.forProject.storage.createBucket(id ? id : ID.unique(), name);
            showCreate = false;
            dispatch('created', bucket);
            addNotification({
                type: 'success',
                message: `${name} ${$LL.components.notification.hasBeenCreated()}`
            });
            name = null;
            trackEvent(Submit.BucketCreate, {
                customId: !!id
            });
        } catch (e) {
            error = e.message;
            trackError(e, Submit.BucketCreate);
        }
    };

    $: if (!showCustomId) {
        id = null;
    }
    $: if (!showCreate) {
        showCustomId = false;
        error = null;
    }
</script>

<Modal {error} onSubmit={create} size="big" bind:show={showCreate}>
    <svelte:fragment slot="header"
        >{$LL.console.project.forms.storage.title.createBucket()}</svelte:fragment>
    <FormList>
        <InputText
            id="name"
            label={$LL.console.project.forms.storage.inputs.name.label()}
            placeholder={$LL.console.project.forms.storage.inputs.name.placeholder()}
            bind:value={name}
            autofocus
            required />

        {#if !showCustomId}
            <div>
                <Pill button on:click={() => (showCustomId = !showCustomId)}>
                    <span class="icon-pencil" aria-hidden="true" />
                    <span class="text"> {$LL.console.project.table.pill.bucketId()} </span>
                </Pill>
            </div>
        {:else}
            <CustomId bind:show={showCustomId} name="Bucket" bind:id />
        {/if}
    </FormList>
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (showCreate = false)}
            >{$LL.console.project.button.cancel()}</Button>
        <Button submit>{$LL.console.project.button.submit.create()}</Button>
    </svelte:fragment>
</Modal>
