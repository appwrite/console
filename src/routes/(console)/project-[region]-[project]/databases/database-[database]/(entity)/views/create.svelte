<script lang="ts">
    import { page } from '$app/state';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal, CustomId } from '$lib/components';
    import { subNavigation } from '$lib/stores/database';
    import { ID } from '@appwrite.io/console';
    import { Button, InputText } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import {
        Input as SuggestionsInput,
        tableColumnSuggestions
    } from '$database/(suggestions)/index';

    import { useTerminology } from '../helpers';

    let {
        show = $bindable(false),
        useSuggestions = true,
        onCreateEntity
    }: {
        show: boolean;
        useSuggestions?: boolean;
        onCreateEntity: (id: string, name: string) => Promise<void>;
    } = $props();

    const entity = $derived(useTerminology(page).entity);
    const lower = $derived(entity.lower.singular);
    const title = $derived(entity.title.singular);

    // example - `table-[table]`, `collection-[collection]`
    const isOnEntitiesPage = $derived(page.route?.id.endsWith(`${lower}-[${lower}]`));

    let name = $state('');
    let id = $state(null);
    let error = $state(null);
    let touchedId = $state(false);
    let creatingEntity = $state(false);

    function enableThinkingModeForSuggestions(id: string, name: string) {
        if (!useSuggestions) return;

        if ($tableColumnSuggestions.enabled) {
            // if enabled, trigger thinking mode!
            tableColumnSuggestions.update((store) => ({
                ...store,
                thinking: true,
                table: {
                    id,
                    name
                }
            }));
        }
    }

    async function createEntity() {
        error = null;
        try {
            // early init setup!
            enableThinkingModeForSuggestions(id, name);

            // create entity.
            await onCreateEntity(id ? id : ID.unique(), name);

            // cleanup
            updateAndCleanup();
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

        // reset vars!
        name = id = null;
        show = creatingEntity = false;
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

        if (!show) {
            name = '';
            id = null;
            error = null;
            touchedId = false;
        }
    });

    $effect(() => {
        // reset is OK here, we don't have to check for entity type!
        if (show && isOnEntitiesPage && $tableColumnSuggestions.table) {
            tableColumnSuggestions.update((store) => ({
                ...store,
                table: null
            }));
        }
    });
</script>

<Modal size="m" bind:show bind:error title="Create {lower}" onSubmit={createEntity}>
    <InputText
        id="name"
        label="Name"
        placeholder="Enter {lower} name"
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
        name={title}
        on:input={() => {
            if (!touchedId) {
                touchedId = true;
            }
        }} />

    {#if useSuggestions}
        <SuggestionsInput />
    {/if}

    <svelte:fragment slot="footer">
        <Button secondary disabled={creatingEntity} on:click={() => (show = false)}>Cancel</Button>
        <Button submit disabled={creatingEntity} submissionLoader forceShowLoader={creatingEntity}
            >Create</Button>
    </svelte:fragment>
</Modal>
