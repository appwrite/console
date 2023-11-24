<script lang="ts">
    import { RegionCard } from '$lib/components';
    import { Flag, Pill } from '$lib/elements';
    import { WizardStep } from '$lib/layout';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { createProject } from './store';
    import type { RegionList } from '$lib/sdk/billing';
    import { user } from '$lib/stores/user';
    import { VARS } from '$lib/system';
    import { addNotification } from '$lib/stores/notifications';

    let regions: RegionList;
    let selectedRegion: string;
    onMount(async () => {
        regions = await sdk.forConsole.billing.listRegions();
    });

    async function notifyRegion() {
        const response = await fetch(
            `https://${VARS.GROWTH_ENDPOINT}/v1/mailinglists/${selectedRegion}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: $user.name,
                    email: $user.email
                })
            }
        );
        if (response.status !== 200) {
            addNotification({
                message: 'There was an error submitting your request',
                type: 'error'
            });
        } else {
            addNotification({
                message: 'Your request was submitted successfully',
                type: 'success'
            });
        }
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
                            class="u-flex u-flex-vertical u-gap-8 u-justify-main-center u-cross-center u-margin-inline-auto">
                            {#if region.disabled}
                                <Flag
                                    width={40}
                                    height={30}
                                    class={region.disabled ? 'u-opacity-50' : ''}
                                    flag={region.flag}
                                    name={region.name} />
                                <p class:u-opacity-50={region.disabled}>{region.name}</p>
                                <Pill
                                    button
                                    event="region_notify"
                                    on:click={() => {
                                        selectedRegion = region.$id;
                                        notifyRegion();
                                    }}>
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
