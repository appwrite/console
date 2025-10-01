<script lang="ts">
    import { page } from '$app/state';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';

    import { Modal, CustomId } from '$lib/components';
    import { Button, InputText } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { ID, type Models } from '@appwrite.io/console';
    import { subNavigation } from '$lib/stores/database';
    import { Input as SuggestionsInput, tableColumnSuggestions } from './(suggestions)/index';

    let {
        showCreate = $bindable(false),
        onTableCreated
    }: {
        showCreate: boolean;
        onTableCreated: (table: Models.Table) => void | Promise<void>;
    } = $props();

    const databaseId = page.params.database;
    const isOnTablesPage = $derived(page.route?.id.endsWith('table-[table]'));

    let name = $state('');
    let id: string = $state(null);
    let touchedId = $state(false);
    let error: string = $state(null);

    let creatingTable = $state(false);

    function enableThinkingModeForSuggestions(table: Models.Table) {
        if ($tableColumnSuggestions.enabled) {
            // if enabled, trigger thinking mode!
            tableColumnSuggestions.update((store) => ({
                ...store,
                thinking: true,
                table: {
                    id: table.$id,
                    name: table.name
                }
            }));
        }
    }

    async function createTable() {
        error = null;
        try {
            const table = await sdk
                .forProject(page.params.region, page.params.project)
                .tablesDB.createTable({
                    databaseId,
                    tableId: id ? id : ID.unique(),
                    name
                });

            updateAndCleanup();

            await onTableCreated(table);

            name = id = null;
            showCreate = false;
            creatingTable = false;

            // don't wait for UI to mount!
            enableThinkingModeForSuggestions(table);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.TableCreate);
        }
    }

    function updateAndCleanup() {
        subNavigation.update();

        addNotification({
            type: 'success',
            message: `${name} has been created`
        });

        trackEvent(Submit.TableCreate, { customId: !!id });
    }

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

    $effect(() => {
        if (showCreate && isOnTablesPage && $tableColumnSuggestions.table) {
            tableColumnSuggestions.update((store) => ({
                ...store,
                table: null
            }));
        }
    });
</script>

<Modal title="Create table" size="m" bind:show={showCreate} onSubmit={createTable} bind:error>
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

    <SuggestionsInput />

    <svelte:fragment slot="footer">
        <Button secondary disabled={creatingTable} on:click={() => (showCreate = false)}
            >Cancel</Button>
        <Button submit disabled={creatingTable} submissionLoader forceShowLoader={creatingTable}
            >Create</Button>
    </svelte:fragment>
</Modal>
