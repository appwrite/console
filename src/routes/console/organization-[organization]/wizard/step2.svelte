<script lang="ts">
    import { RegionCard } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { WizardStep } from '$lib/layout';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { createProject } from './store';
    import type { RegionList } from '$lib/sdk/billing';

    let regions: RegionList;
    onMount(async () => {
        regions = await sdk.forConsole.billing.listRegions();
    });

    function getFlag(country: string) {
        let flag = sdk.forProject.avatars.getFlag(country, 80, 60)?.toString();
        flag?.includes('&project=')
            ? (flag = flag.replace('&project=', '&mode=admin'))
            : flag + '&mode=admin';
        return flag;
    }
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
                            class="u-flex u-flex-vertical u-gap-12 u-justify-main-center u-cross-center u-margin-inline-auto">
                            {#if region.disabled}
                                <img
                                    src={getFlag(region.flag)}
                                    alt={region.name}
                                    width="40"
                                    height="30" />
                                <p class:u-opacity-50={region.disabled}>{region.name}</p>
                                <Pill button>
                                    <span class="icon-bell" aria-hidden="true" />
                                    <span class="text">Notify me</span>
                                </Pill>
                            {:else}
                                <img
                                    src={getFlag(region.flag)}
                                    alt={region.name}
                                    width="40"
                                    height="30" />
                                {region.name}
                            {/if}
                        </div>
                    </RegionCard>
                </li>
            {/each}
        </ul>

        <p class="text u-margin-block-start-16">
            Edge Network is enabled on all regions. For more details, check out our <a
                class="link"
                href="http://#"
                target="_blank"
                rel="noopener noreferrer">Documentation</a
            >.
        </p>
    {/if}
</WizardStep>
