<script lang="ts">
    import { beforeNavigate } from '$app/navigation';
    import { page } from '$app/stores';
    import { INTERVAL } from '$lib/constants';
    import { Logs } from '$lib/layout';
    import Footer from '$lib/layout/footer.svelte';
    import Header from '$lib/layout/header.svelte';
    import SideNavigation from '$lib/layout/navigation.svelte';
    import Shell from '$lib/layout/shell.svelte';
    import { feedback } from '$lib/stores/feedback';
    import { log } from '$lib/stores/logs';
    import { newOrgModal } from '$lib/stores/organization';
    import { wizard } from '$lib/stores/wizard';
    import { onMount } from 'svelte';
    import { loading } from '../store';
    import Create from './createOrganization.svelte';
    import { failedInvoice } from '$lib/stores/billing';
    import { diffDays, toLocaleDate } from '$lib/helpers/date';
    import { base } from '$app/paths';

    let isOpen = false;

    onMount(() => {
        loading.set(false);
        setInterval(() => {
            checkForFeedback(INTERVAL);
        }, INTERVAL);
    });

    function checkForFeedback(interval: number) {
        const minutes = interval / 60000;
        feedback.increaseElapsed(minutes);
        const hours = Math.floor($feedback.elapsed / 60);
        if (hours >= 1 && hours < 10 && $feedback.visualized < 1) {
            feedback.toggleNotification();
            feedback.switchType('nps');
        } else if (hours >= $feedback.visualized * 10) {
            feedback.toggleNotification();
            feedback.switchType('nps');
        }
    }

    beforeNavigate(() => {
        $log.show = false;
    });

    $: if (!$log.show) {
        $log.data = null;
        $log.func = null;
    }
</script>

<Shell
    bind:isOpen
    showSideNavigation={$page.url.pathname !== '/console' &&
        !$page?.params.organization &&
        !$page.url.pathname.includes('/console/account') &&
        !$page.url.pathname.includes('/console/card') &&
        !$page.url.pathname.includes('/console/onboarding')}>
    <svelte:fragment slot="alert">
        {#if $failedInvoice}
            {@const daysPassed = diffDays(new Date($failedInvoice.dueAt), new Date())}
            <section class="alert is-action is-action-and-top-sticky is-danger u-sep-block-end">
                <div class="alert-grid">
                    <span class="icon-info" aria-hidden="true" />
                    <div class="alert-content">
                        <h6 class="alert-title">Your projects are at risk</h6>
                        <p class="alert-message">
                            {#if daysPassed > 30}
                                Your scheduled payment on <b
                                    >{toLocaleDate($failedInvoice.dueAt)}</b> failed. To resume write
                                access of your organization, please update your billing details.
                            {:else}
                                Your scheduled payment on <b
                                    >{toLocaleDate($failedInvoice.dueAt)}</b> failed. Access to The paid
                                projects within this organization will be disabled if no action is taken
                                within 30 days.
                            {/if}
                        </p>
                    </div>
                    <div class="alert-buttons u-flex u-gap-16 u-cross-child-center">
                        <a
                            href={`${base}/console/organization-${$failedInvoice.teamId}/billing`}
                            class="button is-secondary is-full-width-mobile">
                            <span class="text">Update billing details</span>
                        </a>
                    </div>
                </div>
            </section>
        {/if}
    </svelte:fragment>
    <Header slot="header" />
    <SideNavigation slot="side" bind:isOpen />
    <slot />
    <Footer slot="footer" />
</Shell>

{#if $wizard.show && $wizard.component}
    <svelte:component this={$wizard.component} />
{/if}

<Create bind:show={$newOrgModal} />

{#if $log.show}
    <Logs />
{/if}
