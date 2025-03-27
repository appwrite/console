<script lang="ts">
    import { type Payload } from '@appwrite.io/console';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { addNotification } from '$lib/stores/notifications';
    import { base } from '$app/paths';
    import { Typography } from '@appwrite.io/pink-svelte';
    import { page } from '$app/stores';
    let importItems: Map<string, string> = new Map<string, string>();

    function showCompletionNotification(databaseId: string, collectionId: string) {
        const projectId = $page.params.project;
        addNotification({
            type: 'success',
            isHtml: true,
            message: `Documents import through CSV complete.`,
            buttons: [
                {
                    name: 'View imported documents',
                    method: () => {
                        goto(
                            `${base}/project-${projectId}/databases/database-${databaseId}/collection-${collectionId}`
                        );
                    }
                }
            ]
        });
    }

    // TODO: @itznotabug, update after the SDK is available
    function updateOrAddItem(payload: Payload) {}

    function graphSize(status: string): number {
        switch (status) {
            case 'pending':
                return 10;
            case 'processing':
                return 30;
            case 'uploading':
                return 60;
            case 'completed':
            case 'failed':
                return 100;
            default:
                return 30;
        }
    }

    function text(status: string) {
        if (status === 'completed') {
            return `CSV import complete`;
        } else if (status === 'failed') {
            return `CSV import failed`;
        } else {
            return 'Preparing CSV for import...';
        }
    }

    onMount(() => {
        // Mocking data
        //showCsvImportBox = true;
        // importItems.set(ID.unique(), 'something here')
        // importItems.set(ID.unique(), 'something here 2')
        // no idea yet on what events to observe
        // return sdk.forConsole.client.subscribe('console', (response) => {
        //     if (!response.channels.includes(`projects.${getProjectId()}`)) return;
        //
        //     // TODO: @itznotabug, update after SDK is available
        //     if (response.events.includes('*')) {
        //         updateOrAddItem(response.payload);
        //     }
        // });
    });

    $: isOpen = true;
    $: showCsvImportBox = importItems.size > 0;
</script>

{#if showCsvImportBox}
    <div class="box-holder u-flex u-flex-vertical u-gap-16" style="align-items: end">
        <section class="upload-box">
            <header class="upload-box-header">
                <h4 class="upload-box-title">
                    <Typography.Text variant="m-500">
                        Importing documents ({importItems.size})
                    </Typography.Text>
                </h4>
                <button
                    class="upload-box-button"
                    class:is-open={isOpen}
                    aria-label="toggle upload box"
                    on:click={() => {
                        isOpen = !isOpen;
                    }}>
                    <span class="icon-cheveron-up" aria-hidden="true" />
                </button>
                <button
                    class="upload-box-button"
                    aria-label="close backup restore box"
                    on:click={() => (importItems = new Map())}>
                    <span class="icon-x" aria-hidden="true" />
                </button>
            </header>

            {#each [...importItems.entries()] as [key, value]}
                <div class="upload-box-content" class:is-open={isOpen}>
                    <ul class="upload-box-list">
                        <li class="upload-box-item">
                            <section class="progress-bar u-width-full-line">
                                <div
                                    class="progress-bar-top-line u-flex u-gap-8 u-main-space-between">
                                    <Typography.Text>
                                        {text(key)}
                                    </Typography.Text>

                                    <Typography.Caption variant="400">
                                        Collection name
                                    </Typography.Caption>
                                </div>
                                <div
                                    class="progress-bar-container"
                                    class:is-danger={key.status === 'failed'}
                                    style="--graph-size:{graphSize(key.status)}%" />
                            </section>
                        </li>
                    </ul>
                </div>
            {/each}
        </section>
    </div>
{/if}

<style lang="scss">
    .upload-box-title {
        font-size: 11px;
    }

    .upload-box-content {
        min-width: 400px;
        max-width: 100vw;
    }

    .upload-box-button {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .progress-bar-container {
        height: 4px;

        &::before {
            height: 4px;
            background-color: var(--bgcolor-neutral-invert);
        }

        &.is-danger::before {
            height: 4px;
            background-color: var(--bgcolor-error);
        }
    }
</style>
