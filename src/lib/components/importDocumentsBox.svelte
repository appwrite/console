<script lang="ts">
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { isCloud, isSelfHosted } from '$lib/system';
    import { organization } from '$lib/stores/organization';
    import { BillingPlan } from '$lib/constants';
    import { getProjectId } from '$lib/helpers/project';

    let importDocuments = [{}];
    $: showImportDocumentsBox = importDocuments.length !== 0;

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
                return 0;
        }
    }

    function text(status: string) {
        if (status === 'completed') {
            return `Document import complete`;
        } else if (status === 'failed') {
            return `Document import failed`;
        } else {
            return 'Preparing document import...';
        }
    }

    // todo: implement
    function handleClose() {}

    onMount(() => {
        // fast path: don't subscribe if org is on a free plan or is self-hosted.
        // todo: @itznotabug, check on what plans and instances is this allowed!
        if (isSelfHosted || (isCloud && $organization.billingPlan === BillingPlan.FREE)) return;

        return sdk.forConsole.client.subscribe('console', (response) => {
            if (!response.channels.includes(`projects.${getProjectId()}`)) return;

            // todo: @itznotabug, check on what the realtime response looks like!
        });
    });
</script>

{#if showImportDocumentsBox}
    <div class="box-holder u-flex u-flex-vertical u-gap-16" style="align-items: end">
        <section class="upload-box">
            <header class="upload-box-header">
                <h4 class="upload-box-title">
                    \
                    <!-- // todo: check copy -->
                    <span class="text">Documents import</span>
                </h4>
                <!-- // todo: should be a single toggle -->
                <button
                    class="upload-box-button"
                    class:is-open={true}
                    aria-label="toggle upload box"
                    on:click={() => {}}>
                    <span class="icon-cheveron-up" aria-hidden="true" />
                </button>
                <button
                    class="upload-box-button"
                    aria-label="close backup restore box"
                    on:click={() => handleClose()}>
                    <span class="icon-x" aria-hidden="true" />
                </button>
            </header>

            <div class="upload-box-content" class:is-open={true}>
                <ul class="upload-box-list">
                    {#each [importDocuments.values()] as item (item.$id)}
                        <li class="upload-box-item">
                            <section class="progress-bar u-width-full-line">
                                <div
                                    class="progress-bar-top-line u-flex u-gap-8 u-main-space-between">
                                    <span class="body-text-2"> </span>

                                    <span class="backup-name"> </span>
                                </div>
                                <div
                                    class="progress-bar-container"
                                    class:is-danger={item.status === 'failed'}
                                    style="--graph-size:{graphSize(item.status)}%" />
                            </section>
                        </li>
                    {/each}
                </ul>
            </div>
        </section>
    </div>
{/if}

<style>
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

    .backup-name {
        font-size: 12px;
        font-weight: 400;
        line-height: 130%;
        font-style: normal;
        letter-spacing: -0.12px;
        color: var(--mid-neutrals-50, #818186);
        font-family: var(--font-family-sansSerif, Inter);
    }
</style>
