<script lang="ts">
    import { modeOverwrite, modeTier } from '$lib/stores/admin';
    import { SecondaryTabsItem, SecondaryTabs } from './components';
    import { Button } from './elements/forms';
    import { feedback } from './stores/app';

    export let show = false;
</script>

<div class="admin">
    <div class="box u-flex u-gap-24 u-flex-vertical" class:u-hide={show}>
        <h1 class="heading-level-6">Admin</h1>
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
</div>

<style lang="scss">
    .admin {
        position: fixed;
        inset: 50% 100%;
        min-width: 20rem;
        transform: translate(-100%);
    }
</style>
