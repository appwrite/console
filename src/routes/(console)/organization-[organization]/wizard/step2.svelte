<script lang="ts">
    import { RegionCard } from '$lib/components';
    import { Flag, Pill } from '$lib/elements';
    import { WizardStep } from '$lib/layout';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { createProject } from './store';
    import { addNotification } from '$lib/stores/notifications';
    import type { Models } from '@appwrite.io/console';
    import { page } from '$app/stores';
    import { regions } from '$lib/stores/organization';
    import { goto } from '$app/navigation';
    import { upgradeURL } from '$lib/stores/billing';

    let prefs: Models.Preferences;

    onMount(async () => {
        prefs = $page.data.account.prefs;
    });

    async function notifyRegion(selectedRegion: Models.ConsoleRegion) {
        try {
            let newPrefs = { ...prefs };
            newPrefs.notifications ??= [];
            newPrefs.notifications = [...newPrefs.notifications, selectedRegion.$id];
            const response = await sdk.forConsole.account.updatePrefs(newPrefs);
            prefs = response.prefs;
            addNotification({
                type: 'success',
                isHtml: true,
                message: `You will be notified via email when <b>${selectedRegion.name}</b> region is available`
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: 'Something went wrong, please try again later'
            });
        }
    }

    async function unNotifyRegion(selectedRegion: Models.ConsoleRegion) {
        try {
            let newPrefs = { ...prefs };
            newPrefs.notifications = newPrefs.notifications ?? [];
            newPrefs.notifications = [...newPrefs.notifications, selectedRegion.$id];
            newPrefs.notifications = newPrefs.notifications.filter(
                (region: string) => region !== selectedRegion.$id
            );
            const response = await sdk.forConsole.account.updatePrefs(newPrefs);
            prefs = response.prefs;
            addNotification({
                type: 'info',
                isHtml: true,
                message: `You will no longer be notified when the <b>${selectedRegion.name}</b> region is available`
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: 'Something went wrong, please try again later'
            });
        }
    }

    $: notifications = prefs?.notifications ?? [];
</script>

<WizardStep>
    <svelte:fragment slot="title">Regions</svelte:fragment>
    <svelte:fragment slot="subtitle">
        Choose a deployment region for your project. This region cannot be changed.
    </svelte:fragment>
    {#if $regions}
        <ul
            class="grid-box u-margin-block-start-16"
            style="--p-grid-item-size:12em; --p-grid-item-size-small-screens:12rem; --grid-gap: 1rem;">
            {#each $regions.regions.sort((regionA, regionB) => {
                if (regionA.disabled >= regionB.disabled) {
                    return 1;
                }
                return -1;
            }) as region, index}
                <li>
                    <RegionCard
                        name="region"
                        bind:group={$createProject.region}
                        value={region.$id}
                        disabled={region.disabled}
                        autofocus={index === 0}>
                        <!-- focus first item so enter key works! -->
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
                                {#if !notifications.includes(region.$id)}
                                    <Pill
                                        button
                                        event="region_notify"
                                        on:click={() => {
                                            notifyRegion(region);
                                        }}>
                                        <span class="icon-bell" aria-hidden="true" />
                                        <span class="text">Notify me</span>
                                    </Pill>
                                {:else}
                                    <Pill
                                        selected
                                        button
                                        event="region_notify"
                                        on:click={() => {
                                            unNotifyRegion(region);
                                        }}>
                                        <span class="icon-check" aria-hidden="true" />
                                        <span class="text">Notify me</span>
                                    </Pill>
                                {/if}
                            {:else}
                                <Flag
                                    width={40}
                                    height={30}
                                    flag={region.flag}
                                    name={region.name} />
                                {region.name}

                                {#if !region.available}
                                    <Pill
                                        button
                                        event="upgrade_from_region_chooser"
                                        on:click={() => goto($upgradeURL)}>
                                        <span class="text">Upgrade</span>
                                    </Pill>
                                {/if}
                            {/if}
                        </div>
                    </RegionCard>
                </li>
            {/each}
        </ul>
    {/if}
</WizardStep>
