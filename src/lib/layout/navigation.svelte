<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { trackEvent } from '$lib/actions/analytics';
    import { BillingPlan } from '$lib/constants';
    import { isMac } from '$lib/helpers/platform';
    import { slide } from '$lib/helpers/transition';
    import { upgradeURL } from '$lib/stores/billing';
    import { organization } from '$lib/stores/organization';
    import { canSeeDatabases } from '$lib/stores/roles';
    import { wizard } from '$lib/stores/wizard';
    import { isCloud } from '$lib/system';
    import Create from '$routes/(console)/feedbackWizard.svelte';
    import { showSupportModal } from '$routes/(console)/wizard/support/store';
    import { getContext } from 'svelte';
    import type { Writable } from 'svelte/store';
    import { Tooltip } from '@appwrite.io/pink-svelte';
    import { showSubNavigation } from '$lib/stores/layout';

    export let isOpen = false;

    $: project = $page.params.project;
    $: projectPath = `${base}/project-${project}`;

    $: subNavigation = $page.data.subNavigation;
    // We need to have this second variable, because we only want narrow
    // to change automatically if we change from having a second side nav to
    // not having one, not when the second side nav changes to a different value.
    $: hasSubNavigation = !!subNavigation;

    let narrow = false;
    $: {
        narrow = hasSubNavigation;
    }

    $: getContext<Writable<boolean>>('isNarrow').set(narrow);
    $: getContext<Writable<boolean>>('hasSubNavigation').set(hasSubNavigation);

    function handleKeyDown(event: KeyboardEvent) {
        // If Alt + S is pressed
        if (hasSubNavigation && event.altKey && event.keyCode === 83) {
            event.preventDefault();
            narrow = !narrow;
        }
    }

    function openFeedback() {
        $showSubNavigation = false;
        wizard.start(Create);
    }

    function openSupport() {
        $showSubNavigation = false;
        $showSupportModal = true;
    }
</script>

<svelte:window on:keydown={handleKeyDown} />

<div class="side-nav" class:is-open-level-2={hasSubNavigation}>
    <div class="side-nav-level-1" class:is-narrow={narrow}>
        {#if project}
            <div class="side-nav-main">
                <section class="drop-section">
                    <ul class="drop-list">
                        <li class="drop-list-item">
                            <Tooltip placement="right" disabled={!narrow} inline={false}>
                                <a
                                    class="drop-button"
                                    class:is-selected={$page.url.pathname.startsWith(
                                        `${projectPath}/overview`
                                    )}
                                    on:click={() => trackEvent('click_menu_overview')}
                                    href={projectPath}>
                                    <span class="icon-chart-bar" aria-hidden="true" />
                                    <span class="text">Overview</span>
                                </a>
                                <div slot="tooltip">Overview</div>
                            </Tooltip>
                        </li>
                        <li class="drop-list-item">
                            <Tooltip placement="right" disabled={!narrow} inline={false}>
                                <a
                                    class="drop-button"
                                    class:is-selected={$page.url.pathname.startsWith(
                                        `${projectPath}/auth`
                                    )}
                                    on:click={() => trackEvent('click_menu_auth')}
                                    href={`${projectPath}/auth`}>
                                    <span class="icon-user-group" aria-hidden="true" />
                                    <span class="text">Auth</span>
                                </a>
                                <div slot="tooltip">Auth</div>
                            </Tooltip>
                        </li>
                        {#if $canSeeDatabases}
                            <li class="drop-list-item">
                                <Tooltip placement="right" disabled={!narrow} inline={false}>
                                    <a
                                        class="drop-button"
                                        class:is-selected={$page.url.pathname.startsWith(
                                            `${projectPath}/databases`
                                        )}
                                        on:click={() => trackEvent('click_menu_databases')}
                                        href={`${projectPath}/databases`}>
                                        <span class="icon-database" aria-hidden="true" />
                                        <span class="text">Databases</span>
                                    </a>
                                    <span slot="tooltip">Databases</span>
                                </Tooltip>
                            </li>
                        {/if}
                        <li class="drop-list-item">
                            <Tooltip placement="right" disabled={!narrow} inline={false}>
                                <a
                                    class="drop-button"
                                    class:is-selected={$page.url.pathname.startsWith(
                                        `${projectPath}/functions`
                                    )}
                                    on:click={() => trackEvent('click_menu_functions')}
                                    href={`${projectPath}/functions`}>
                                    <span class="icon-lightning-bolt" aria-hidden="true" />
                                    <span class="text">Functions</span>
                                </a>
                                <span slot="tooltip">Functions</span>
                            </Tooltip>
                        </li>
                        <li class="drop-list-item">
                            <Tooltip placement="right" disabled={!narrow} inline={false}>
                                <a
                                    class="drop-button"
                                    class:is-selected={$page.url.pathname.startsWith(
                                        `${projectPath}/messaging`
                                    )}
                                    on:click={() => trackEvent('click_menu_messaging')}
                                    href={`${projectPath}/messaging`}>
                                    <span class="icon-send" aria-hidden="true" />
                                    <span class="text">Messaging</span>
                                </a>
                                <span slot="tooltip">Messaging</span>
                            </Tooltip>
                        </li>
                        <li class="drop-list-item">
                            <Tooltip placement="right" disabled={!narrow} inline={false}>
                                <a
                                    class="drop-button"
                                    class:is-selected={$page.url.pathname.startsWith(
                                        `${projectPath}/sites`
                                    )}
                                    on:click={() => trackEvent('click_menu_sites')}
                                    href={`${projectPath}/sites`}>
                                    <span class="icon-globe-alt" aria-hidden="true" />
                                    <span class="text">Sites</span>
                                </a>
                                <span slot="tooltip">Sites</span>
                            </Tooltip>
                        </li>
                        <li class="drop-list-item">
                            <Tooltip placement="right" disabled={!narrow} inline={false}>
                                <a
                                    class="drop-button"
                                    class:is-selected={$page.url.pathname.startsWith(
                                        `${projectPath}/storage`
                                    )}
                                    on:click={() => trackEvent('click_menu_storage')}
                                    href={`${projectPath}/storage`}>
                                    <span class="icon-folder" aria-hidden="true" />
                                    <span class="text">Storage</span>
                                </a>
                                <span slot="tooltip">Storage</span>
                            </Tooltip>
                        </li>
                        <li class="drop-list-item is-not-desktop">
                            <Tooltip placement="right" disabled={!narrow} inline={false}>
                                <a
                                    class="drop-button"
                                    href={`${projectPath}/settings`}
                                    on:click={() => trackEvent('click_menu_settings')}
                                    class:is-selected={$page.url.pathname.startsWith(
                                        `${projectPath}/settings`
                                    )}
                                    title="Settings">
                                    <span class="icon-cog" aria-hidden="true" />
                                    <span class="text">Settings</span>
                                </a>
                                <span slot="tooltip">Settings</span>
                            </Tooltip>
                        </li>
                    </ul>
                </section>
            </div>

            <div class="side-nav-bottom">
                <section class="drop-section">
                    <Tooltip placement="right" disabled={!narrow} inline={false}>
                        <a
                            class="drop-button is-only-desktop"
                            href={`${projectPath}/settings`}
                            on:click={() => trackEvent('click_menu_settings')}
                            class:is-selected={$page.url.pathname.startsWith(
                                `${projectPath}/settings`
                            )}
                            title="Settings">
                            <span class="icon-cog" aria-hidden="true" />
                            <span class="text">Settings</span>
                        </a>
                        <span slot="tooltip">Settings</span>
                    </Tooltip>

                    <ul class="drop-list is-not-desktop">
                        {#if isCloud && $organization?.billingPlan !== BillingPlan.SCALE}
                            <li class="drop-list-item">
                                <a class="drop-button" href={$upgradeURL}>
                                    <span class="text">Upgrade</span>
                                </a>
                            </li>
                        {/if}
                        <li class="drop-list-item">
                            <button class="drop-button" on:click={openSupport}>
                                <span class="text">Support</span>
                            </button>
                        </li>
                        <li class="drop-list-item">
                            <button class="drop-button" on:click={openFeedback}>
                                <span class="text">Feedback</span>
                            </button>
                        </li>
                    </ul>
                </section>
            </div>
        {/if}

        {#if subNavigation}
            <Tooltip placement="right" disabled={!narrow} inline={false}>
                <button
                    class="side-nav-button button is-small is-secondary is-not-mobile"
                    aria-label="resize menu"
                    on:click={() => (narrow = !narrow)}>
                    <span
                        class:icon-cheveron-right={narrow}
                        class:icon-cheveron-left={!narrow}
                        aria-hidden="true" />
                </button>
                <span slot="tooltip">{isMac() ? '⌥ + S' : 'Alt + S'}</span>
            </Tooltip>
        {/if}
    </div>

    {#if subNavigation}
        <div class="side-nav-level-2 is-open" transition:slide={{ axis: 'x', duration: 250 }}>
            <div class="side-nav-main">
                <svelte:component this={subNavigation} />
            </div>
        </div>
    {/if}
</div>

<style>
    .side-nav {
        z-index: 9999;
    }
</style>
