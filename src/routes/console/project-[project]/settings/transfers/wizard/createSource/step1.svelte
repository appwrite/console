<script lang="ts">
    import { app } from '$lib/stores/app';
    import { WizardStep } from '$lib/layout';
    import Pill from '$lib/elements/pill.svelte';
    import { createSource } from '../store';

    let options = ['Firebase', 'Supabase', 'NHost', 'Appwrite'];
</script>

<WizardStep>
    <svelte:fragment slot="title">Select Provider</svelte:fragment>
    <svelte:fragment slot="subtitle"
        >Please select the provider you want to use for this source.</svelte:fragment>

    <section class="common-section">
        <h2 class="heading-level-6 common-section">Sources</h2>
        <input
            class="u-hide"
            type="checkbox"
            name="isVerified"
            required
            bind:checked={$createSource.type} />
        <ul class="grid-box common-section">
            {#each options.filter((p) => p !== 'Local') as source}
                <li class="grid-box-item">
                    <button
                        on:click={() => {
                            createSource.update((d) => {
                                d.type = source.toLowerCase();
                                return d;
                            });
                        }}
                        class="card u-flex u-flex-vertical u-cross-center u-width-full-line">
                        <div class="image-item">
                            <img
                                height="20"
                                width="20"
                                src={`/icons/${$app.themeInUse}/color/${source.toLowerCase()}.svg`}
                                alt={source} />
                        </div>
                        <p class="u-margin-block-start-8">{source}</p>
                        <div class="u-margin-block-start-24">
                            {#if $createSource.type && $createSource.type.toLowerCase() == source.toLowerCase()}
                                <Pill success={true}>
                                    <span class="icon-check-circle" />
                                </Pill>
                            {/if}
                        </div>
                    </button>
                </li>
            {/each}
        </ul>
    </section>
</WizardStep>
