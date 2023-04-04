<script lang="ts">
    import { app } from '$lib/stores/app';
    import { WizardStep } from '$lib/layout';
    import Pill from '$lib/elements/pill.svelte';
    import { createDestination } from '../store';

    let options = ['Appwrite'];
</script>

<WizardStep>
    <svelte:fragment slot="title">Select Provider</svelte:fragment>
    <svelte:fragment slot="subtitle"
        >Please select the provider you want to use for this destination.</svelte:fragment>

    <section class="common-section">
        <h2 class="heading-level-6 common-section">Destinations</h2>
        <input
            class="u-hide"
            type="checkbox"
            name="isVerified"
            required
            bind:checked={$createDestination.type} />
        <ul class="grid-box common-section">
            {#each options.filter((p) => p !== 'Local') as destination}
                <li class="grid-box-item">
                    <button
                        on:click={() => {
                            createDestination.update((d) => {
                                d.type = destination.toLowerCase();
                                return d;
                            });
                        }}
                        class="card u-flex u-flex-vertical u-cross-center u-width-full-line">
                        <div class="image-item">
                            <img
                                height="20"
                                width="20"
                                src={`/icons/${
                                    $app.themeInUse
                                }/color/${destination.toLowerCase()}.svg`}
                                alt={destination} />
                        </div>
                        <p class="u-margin-block-start-8">{destination}</p>
                        <div class="u-margin-block-start-24">
                            {#if $createDestination.type && $createDestination.type.toLowerCase() == destination.toLowerCase()}
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
