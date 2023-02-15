<script lang="ts">
    import { modeOverwrite, modeTier } from '$lib/stores/admin';
    import { SecondaryTabsItem, SecondaryTabs } from './components';
    import { Button } from './elements/forms';
    import { feedback } from './stores/app';

    export let show = false;
</script>

<div class="admin">
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
            <div>
                <p>Mode:</p>
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
            <div>
                <p>Tier:</p>
                <SecondaryTabs>
                    <SecondaryTabsItem
                        disabled={$modeTier === 'base'}
                        on:click={() => modeTier.set('base')}>
                        Base
                    </SecondaryTabsItem>
                    <SecondaryTabsItem
                        disabled={$modeTier === 'premium'}
                        on:click={() => modeTier.set('premium')}>
                        Premium
                    </SecondaryTabsItem>
                    <SecondaryTabsItem
                        disabled={$modeTier === 'enterprise'}
                        on:click={() => modeTier.set('enterprise')}>
                        Enterprise
                    </SecondaryTabsItem>
                </SecondaryTabs>
            </div>
            <Button
                secondary
                on:click={() => {
                    $feedback.type === 'general'
                        ? feedback.switchType('nps')
                        : feedback.switchType('general');
                }}>Switch Feedback</Button>
        </div>
    {:else}
        <Button round text secondary on:click={() => (show = true)}>
            <span class="icon-academic-cap" />
        </Button>
    {/if}
</div>

<style lang="scss">
    .admin {
        position: fixed;
        top: 50%;
        right: 0;
        transform: translateY(-50%);
    }
</style>
