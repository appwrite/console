<script lang="ts">
    import { onMount } from 'svelte';
    import { resolve } from '$app/paths';
    import { page } from '$app/state';
    import { goto } from '$app/navigation';
    import { Wizard } from '$lib/layout';
    import { Fieldset, Layout } from '@appwrite.io/pink-svelte';
    import { Button, InputCheckbox, Form } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { toLocalDateTimeISO } from '$lib/helpers/date';
    import { writable } from 'svelte/store';
    import { queries, type TagValue } from '$lib/components/filters/store';
    import { TagList } from '$lib/components/filters';

    let showExitModal = $state(false);
    let formComponent: Form;
    let isSubmitting = $state(writable(false));

    let localQueries = $state<Map<TagValue, string>>(new Map());
    const localTags = $derived(Array.from(localQueries.keys()));

    const timestamp = toLocalDateTimeISO(Date.now())
        .replace(/[:.]/g, '-')
        .split('T')
        .join('_')
        .slice(0, -4);

    const collectionName = page.params.collection;
    const filename = `${collectionName}_${timestamp}.json`;

    let exportWithFilters = $state(false);

    const collectionUrl = $derived.by(() => {
        const queryParam = page.url.searchParams.get('query');
        const url = resolve(
            '/(console)/project-[region]-[project]/databases/database-[database]/collection-[collection]',
            {
                region: page.params.region,
                project: page.params.project,
                database: page.params.database,
                collection: page.params.collection
            }
        );
        return queryParam ? `${url}?query=${encodeURIComponent(queryParam)}` : url;
    });

    function removeLocalFilter(tag: TagValue) {
        localQueries.delete(tag);
        localQueries = new Map(localQueries);
    }

    async function handleExport() {
        try {
            await (
                sdk.forProject(page.params.region, page.params.project).migrations as unknown as {
                    createJSONExport: (params: {
                        resourceId: string;
                        filename: string;
                        columns: string[];
                        queries: string[];
                        notify: boolean;
                    }) => Promise<unknown>;
                }
            ).createJSONExport({
                resourceId: `${page.params.database}:${page.params.collection}`,
                filename: filename,
                columns: [],
                queries: exportWithFilters ? Array.from(localQueries.values()) : [],
                notify: true
            });

            addNotification({
                type: 'success',
                message: 'JSON export has started. You will receive an email when it is ready.'
            });

            trackEvent(Submit.DatabaseExportCsv);

            await goto(collectionUrl);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });

            trackError(error, Submit.DatabaseExportCsv);
        }
    }

    onMount(() => {
        localQueries = new Map($queries);
    });
</script>

<Wizard
    title="Export JSON"
    columnSize="s"
    href={collectionUrl}
    bind:showExitModal
    confirmExit
    column>
    <Form bind:this={formComponent} bind:isSubmitting onSubmit={handleExport}>
        <Layout.Stack gap="xxl">
            <Fieldset legend="Export options">
                <Layout.Stack gap="l">
                    <Layout.Stack gap="m">
                        <div class:disabled-checkbox={localTags.length === 0}>
                            <InputCheckbox
                                id="exportWithFilters"
                                label="Export with filters"
                                description="Export documents that match the current collection filters"
                                disabled={localTags.length === 0}
                                bind:checked={exportWithFilters} />
                        </div>

                        {#if localTags.length > 0}
                            <Layout.Stack
                                direction="row"
                                gap="xs"
                                alignItems="center"
                                style="padding-left: 1.75rem;"
                                wrap="wrap">
                                <TagList
                                    tags={localTags}
                                    on:remove={(e) => {
                                        removeLocalFilter(e.detail);
                                    }} />
                            </Layout.Stack>
                        {/if}
                    </Layout.Stack>
                </Layout.Stack>
            </Fieldset>
        </Layout.Stack>
    </Form>
    <svelte:fragment slot="footer">
        <Layout.Stack justifyContent="flex-end" direction="row">
            <Button fullWidthMobile secondary on:click={() => (showExitModal = true)}>
                Cancel
            </Button>
            <Button
                fullWidthMobile
                on:click={() => formComponent.triggerSubmit()}
                disabled={$isSubmitting}>
                Export
            </Button>
        </Layout.Stack>
    </svelte:fragment>
</Wizard>

<style>
    .disabled-checkbox :global(*) {
        cursor: unset;
    }
</style>
