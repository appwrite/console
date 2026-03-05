<script lang="ts">
    import { page } from '$app/state';
    import { trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal, CustomId } from '$lib/components';
    import { subNavigation } from '$lib/stores/database';
    import { ID } from '@appwrite.io/console';
    import { Button, InputText } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import {
        Input as SuggestionsInput,
        entityColumnSuggestions
    } from '$database/(suggestions)/index';

    import { getTerminologies } from '../helpers';
    import { resetSampleFieldsConfig } from '$database/store';

    let {
        show = $bindable(false),
        useSuggestions = true,
        onCreateEntity
    }: {
        show: boolean;
        useSuggestions?: boolean;
        onCreateEntity: (id: string, name: string) => Promise<void>;
    } = $props();

    const { analytics, terminology } = getTerminologies();

    const lower = terminology.entity.lower.singular;
    const title = terminology.entity.title.singular;
    const analyticsCreateSubmit = analytics.submit.entity('Create');

    // example - `table-[table]`, `collection-[collection]`
    const isOnEntitiesPage = $derived(page.route?.id.endsWith(`${lower}-[${lower}]`));

    let name = $state('');
    let id = $state(null);
    let error = $state(null);
    let creatingEntity = $state(false);

    function enableThinkingModeForSuggestions(id: string, name: string) {
        if (!useSuggestions) return;

        if ($entityColumnSuggestions.enabled) {
            // if enabled, trigger thinking mode!
            entityColumnSuggestions.update((store) => ({
                ...store,
                thinking: true,
                entity: {
                    id,
                    name
                }
            }));
        }
    }

    async function createEntity() {
        error = null;
        creatingEntity = true;
        try {
            const finalId = id || ID.unique();

            // early init setup!
            enableThinkingModeForSuggestions(finalId, name);

            // create entity.
            await onCreateEntity(finalId, name);

            // cleanup
            updateAndCleanup();
        } catch (e) {
            error = e.message;
            trackError(e, analyticsCreateSubmit);
        } finally {
            creatingEntity = false;
            resetSampleFieldsConfig();
        }
    }

    function updateAndCleanup() {
        subNavigation.update();

        addNotification({
            type: 'success',
            message: `${name} has been created`
        });

        trackEvent(analyticsCreateSubmit, { customId: !!id });

        id = null;
        name = '';
        show = false;
    }

    $effect(() => {
        if (!show) {
            id = null;
            error = null;
        }
    });

    $effect(() => {
        // reset is OK here, we don't have to check for entity type!
        if (show && isOnEntitiesPage && $entityColumnSuggestions.entity) {
            entityColumnSuggestions.update((store) => ({
                ...store,
                entity: null
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
        required />

    <CustomId show bind:id required={false} autofocus={false} name={title} syncFrom={name} />

    {#if useSuggestions}
        <SuggestionsInput showSampleCountPicker={!terminology.schema} />
    {/if}

    <svelte:fragment slot="footer">
        <Button secondary disabled={creatingEntity} on:click={() => (show = false)}>Cancel</Button>
        <Button submit disabled={creatingEntity} submissionLoader forceShowLoader={creatingEntity}
            >Create</Button>
    </svelte:fragment>
</Modal>
