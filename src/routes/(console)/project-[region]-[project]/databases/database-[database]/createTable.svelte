<script lang="ts">
    import { page } from '$app/state';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';

    import { Modal, CustomId } from '$lib/components';
    import { Button, InputText } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { ID } from '@appwrite.io/console';
    import { createEventDispatcher } from 'svelte';

    let {
        showCreate = $bindable(false)
    }: {
        showCreate: boolean;
    } = $props();

    const databaseId = page.params.database;
    const dispatch = createEventDispatcher();

    let name = $state('');
    let id: string = $state(null);
    let touchedId = $state(false);
    let error: string = $state(null);

    const create = async () => {
        error = null;
        try {
            const table = await sdk
                .forProject(page.params.region, page.params.project)
                .grids.createTable(databaseId, id ? id : ID.unique(), name);

            showCreate = false;

            dispatch('created', table);
            addNotification({
                type: 'success',
                message: `${name} has been created`
            });
            name = id = null;
            trackEvent(Submit.TableCreate, {
                customId: !!id
            });
        } catch (e) {
            error = e.message;
            trackError(e, Submit.TableCreate);
        }
    };

    function toIdFormat(str: string): string {
        return str
            .toLowerCase()
            .replace(/[^a-z0-9\-_. ]+/g, '')
            .replace(/ /g, '_')
            .replace(/^-+/, '')
            .replace(/\.+$/, '')
            .replace(/_{2,}/g, '_')
            .slice(0, 36); // max length
    }

    $effect(() => {
        if (!touchedId && name) {
            id = toIdFormat(name);
        }

        if (!showCreate) {
            name = '';
            id = null;
            error = null;
            touchedId = false;
        }
    });
</script>

<Modal title="Create table" size="m" bind:show={showCreate} onSubmit={create} bind:error>
    <InputText
        id="name"
        label="Name"
        placeholder="Enter table name"
        bind:value={name}
        autofocus
        required
        on:input={() => {
            if (!touchedId) {
                id = toIdFormat(name);
            }
        }} />

    <CustomId
        show
        bind:id
        required={false}
        autofocus={false}
        name="Table"
        on:input={() => {
            if (!touchedId) {
                touchedId = true;
            }
        }} />

    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (showCreate = false)}>Cancel</Button>
        <Button submit>Create</Button>
    </svelte:fragment>
</Modal>
