<script lang="ts">
    import { trackEvent } from '$lib/actions/analytics';
    import { app } from '$lib/stores/app';
    import { WizardStep } from '$lib/layout';
    import { sdkForProject } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { createTransfer } from '../store';
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';

    let options = [];

    onMount(async () => {
        let sources = await sdkForProject.transfers.listSources();
        options = sources.sources.map((source) => ({
            name: `${source.name}`,
            type: `${source.type}`,
            value: `${source.$id}`
        }));
    });
</script>

<WizardStep>
    <svelte:fragment slot="title">Create your Transfer</svelte:fragment>
    <svelte:fragment slot="subtitle"
        >Please select the source you want to use for this transfer.</svelte:fragment>
    <section class="common-section">
        <h2 class="heading-level-6 common-section">Sources</h2>
        <input
            class="u-hide"
            bind:checked={$createTransfer.source}
            type="checkbox"
            name="hasSelected"
            required />
        <ul class="grid-box common-section">
            {#each options.filter((p) => p.name !== 'Local') as source}
                <li class="grid-box-item">
                    <button
                        class="card u-flex u-flex-vertical u-cross-center u-width-full-line"
                        on:click={() => {
                            $createTransfer.source = source.value;
                            trackEvent(`click_select_source`, {
                                name: source.name.toLowerCase(),
                                type: source.type.toLowerCase()
                            });
                        }}>
                        <div class="image-item">
                            <img
                                height="20"
                                width="20"
                                src={`/icons/${$app.themeInUse}/color/${source.type}.svg`}
                                alt={source.type} />
                        </div>
                        <p class="u-margin-block-start-8">{source.name}</p>
                    </button>
                </li>
            {/each}
            <li class="grid-box-item">
                <button
                    class="card u-flex u-flex-vertical u-cross-center u-width-half-line"
                    on:click={() =>
                        goto(
                            `${base}/console/project-${$page.params.project}/settings/transfers/sources?openWizard=true`
                        )}>
                    <div class="image-item">
                        <span class="icon-plus" />
                    </div>
                    <p class="u-margin-block-start-8">Create new source</p>
                </button>
            </li>
        </ul>
    </section>
</WizardStep>
