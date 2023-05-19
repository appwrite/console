<script lang="ts">
    import { modeOverwrite, tierOverwrite } from '$lib/stores/admin';
    import { SecondaryTabsItem, SecondaryTabs } from './components';
    import { Button } from './elements/forms';
    import { feedback } from './stores/app';

    export let show = false;

    let admin: HTMLDivElement;

    function handleBLur(event: MouseEvent) {
        if (show && !(event.target === admin || admin.contains(event.target as Node))) {
            show = false;
        }
    }

    function handleKeydown(event: KeyboardEvent) {
        if (show && event.key === 'Escape') {
            event.preventDefault();
            show = false;
        }
    }
</script>

<svelte:window on:mousedown={handleBLur} on:keydown={handleKeydown} />

<div class="admin" bind:this={admin} on:blur={() => console.log('test')}>
    {#if show}
        <div class="box u-flex u-gap-24 u-flex-vertical">
            <div class="u-flex u-cross-center">
                <h1 class="heading-level-6">Admin Panel</h1>

                <button
                    type="button"
                    class="button is-text is-only-icon u-margin-inline-start-auto"
                    style="--button-size:1.5rem;"
                    aria-label="Close Admin"
                    title="Close Admin"
                    on:click={() => (show = false)}>
                    <span class="icon-x" aria-hidden="true" />
                </button>
            </div>
            <div class="u-flex u-flex-vertical u-gap-8">
                <h2 class="eyebrow-heading-3">Mode:</h2>
                <SecondaryTabs>
                    <SecondaryTabsItem
                        disabled={$modeOverwrite === 'self-hosted'}
                        on:click={() => modeOverwrite.set('self-hosted')}>
                        Self
                    </SecondaryTabsItem>
                    <SecondaryTabsItem
                        disabled={$modeOverwrite === 'cloud'}
                        on:click={() => modeOverwrite.set('cloud')}>
                        Cloud
                    </SecondaryTabsItem>
                </SecondaryTabs>
            </div>
            <div class="u-flex u-flex-vertical u-gap-8">
                <h2 class="eyebrow-heading-3">Tier:</h2>
                <SecondaryTabs>
                    <SecondaryTabsItem
                        disabled={$tierOverwrite === 'base'}
                        on:click={() => tierOverwrite.set('base')}>
                        Free
                    </SecondaryTabsItem>
                    <SecondaryTabsItem
                        disabled={$tierOverwrite === 'premium'}
                        on:click={() => tierOverwrite.set('premium')}>
                        Pro
                    </SecondaryTabsItem>
                    <SecondaryTabsItem
                        disabled={$tierOverwrite === 'enterprise'}
                        on:click={() => tierOverwrite.set('enterprise')}>
                        Enterprise
                    </SecondaryTabsItem>
                </SecondaryTabs>
            </div>
            <div class="u-flex u-flex-vertical u-gap-8">
                <h2 class="eyebrow-heading-3">Feedback:</h2>
                <SecondaryTabs>
                    <SecondaryTabsItem
                        disabled={$feedback.type === 'general'}
                        on:click={() => feedback.switchType('general')}>
                        General
                    </SecondaryTabsItem>
                    <SecondaryTabsItem
                        disabled={$feedback.type === 'nps'}
                        on:click={() => feedback.switchType('nps')}>
                        NPS
                    </SecondaryTabsItem>
                </SecondaryTabs>
            </div>
        </div>
    {:else}
        <div class="admin-btn">
            <Button round text secondary on:click={() => (show = true)}>
                <span class="icon-beaker" />
            </Button>
        </div>
    {/if}
</div>

<style lang="scss">
    .admin {
        position: fixed;
        top: 70%;
        right: 0;
        transform: translateY(-50%);
        border-radius: 0.5rem 0 0 0.5rem;
        z-index: 1000;

        &-btn {
            border: 1px solid hsl(var(--color-neutral-100));
            border-radius: 0.5rem 0 0 0.5rem;
        }
    }
</style>
