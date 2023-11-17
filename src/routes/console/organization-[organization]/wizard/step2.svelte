<script lang="ts">
    import { RegionCard } from '$lib/components';
    import { Flag, Pill } from '$lib/elements';
    import { WizardStep } from '$lib/layout';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { createProject } from './store';
    import type { RegionList } from '$lib/sdk/billing';

    let regions: RegionList;
    onMount(async () => {
        regions = await sdk.forConsole.billing.listRegions();
    });
</script>

<WizardStep>
    <svelte:fragment slot="title">Select region</svelte:fragment>
    <svelte:fragment slot="subtitle">
        Choose a deployment region for your project. This region cannot be changed.
    </svelte:fragment>
    {#if regions?.total}
        <ul
            class="grid-box u-margin-block-start-16"
            style="--p-grid-item-size:12em; --p-grid-item-size-small-screens:12rem; --grid-gap: 1rem;">
            {#each regions.regions as region}
                <li>
                    <RegionCard
                        name="region"
                        bind:group={$createProject.region}
                        value={region.$id}
                        disabled={region.disabled}>
                        <div
                            class="u-flex u-flex-vertical u-gap-8 u-justify-main-center u-cross-center u-margin-inline-auto">
                            {#if region.disabled}
                                <Flag
                                    width={40}
                                    height={30}
                                    class={region.disabled ? 'u-opacity-50' : ''}
                                    flag={region.flag}
                                    name={region.name} />
                                <p class:u-opacity-50={region.disabled}>{region.name}</p>
                                <Pill button event="region_notify">
                                    <span class="icon-bell" aria-hidden="true" />
                                    <span class="text">Notify me</span>
                                </Pill>
                            {:else}
                                <Flag
                                    width={40}
                                    height={30}
                                    flag={region.flag}
                                    name={region.name} />

                                {region.name}
                            {/if}
                        </div>
                    </RegionCard>
                </li>
            {/each}
        </ul>
    {/if}
</WizardStep>
