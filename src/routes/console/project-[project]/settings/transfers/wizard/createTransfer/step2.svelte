<script lang="ts">
    import { trackEvent } from '$lib/actions/analytics';
    import { app } from '$lib/stores/app';
    import { WizardStep } from '$lib/layout';
    import { sdkForProject } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { createTransfer } from '../store';
    import { base } from '$app/paths';
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';

    let options = [];

    onMount(async () => {
        let destinations = await sdkForProject.transfers.listDestinations();
        options = destinations.destinations.map((destination) => ({
            name: `${destination.name}`,
            type: `${destination.type}`,
            value: `${destination.$id}`
        }));
    });
</script>

<WizardStep>
    <svelte:fragment slot="title">Create your Transfer</svelte:fragment>
    <svelte:fragment slot="subtitle"
        >Please select the destination you want to use for this transfer.</svelte:fragment>
    <section class="common-section">
        <input
            class="u-hide"
            bind:checked={$createTransfer.destination}
            type="checkbox"
            name="hasSelected"
            required />
        <h2 class="heading-level-6 common-section">Destinations</h2>
        <ul class="grid-box common-section">
            {#each options.filter((p) => p.name !== 'Local') as destination}
                <li class="grid-box-item">
                    <button
                        class="card u-flex u-flex-vertical u-cross-center u-width-full-line"
                        on:click={() => {
                            $createTransfer.destination = destination.value;
                            trackEvent(`click_select_destination`, {
                                name: destination.name.toLowerCase(),
                                type: destination.type.toLowerCase()
                            });
                        }}>
                        <div class="image-item">
                            <img
                                height="20"
                                width="20"
                                src={`/icons/${$app.themeInUse}/color/${destination.type}.svg`}
                                alt={destination.type} />
                        </div>
                        <p class="u-margin-block-start-8">{destination.name}</p>
                    </button>
                </li>
            {/each}
            <li class="grid-box-item">
                <button
                    class="card u-flex u-flex-vertical u-cross-center u-width-half-line"
                    on:click={() =>
                        goto(
                            `${base}/console/project-${$page.params.project}/settings/transfers/destinations`
                        )}>
                    <div class="image-item">
                        <span class="icon-plus" />
                    </div>
                    <p class="u-margin-block-start-8">Create new destination</p>
                </button>
            </li>
        </ul>
    </section>
</WizardStep>
