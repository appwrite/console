<script lang="ts">
    import { page } from '$app/state';
    import { resolve } from '$app/paths';
    import { goto } from '$app/navigation';

    import Input from './input.svelte';
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { entityColumnSuggestions } from './store';

    let {
        show = $bindable(false)
    }: {
        show?: boolean;
    } = $props();

    const isOnRowsPage = $derived(page.route?.id?.endsWith('table-[table]'));

    function resetSuggestionsStore() {
        show = false;

        $entityColumnSuggestions.entity = null;
        $entityColumnSuggestions.context = null;

        $entityColumnSuggestions.force = false;
        $entityColumnSuggestions.enabled = false;
        $entityColumnSuggestions.thinking = false;
    }

    async function triggerColumnSuggestions() {
        // set table info. first!
        $entityColumnSuggestions.entity = {
            id: page.params.table,
            name: page.data.table?.name ?? 'Table'
        };

        if (!isOnRowsPage) {
            await goto(
                resolve(
                    '/(console)/project-[region]-[project]/databases/database-[database]/table-[table]',
                    {
                        region: page.params.region,
                        project: page.params.project,
                        database: page.params.database,
                        table: page.params.table
                    }
                )
            );
        }

        $entityColumnSuggestions.force = true;
        $entityColumnSuggestions.enabled = true;

        show = false;
    }
</script>

<Modal bind:show title="Suggest columns" onSubmit={triggerColumnSuggestions}>
    <Input isModal />

    <svelte:fragment slot="footer">
        <Button text on:click={resetSuggestionsStore}>Cancel</Button>
        <Button submit>Generate columns</Button>
    </svelte:fragment>
</Modal>
