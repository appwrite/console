<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { trackEvent } from '$lib/actions/analytics';
    import { tooltip } from '$lib/actions/tooltip';
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
    import { showSubNavigation } from '$lib/stores/layout';

    $: projectPath = `${base}/project-${$page.params.region}-${$page.params.project}`;

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
        {#if $page.params.project}
            <div class="side-nav-main">
                <section class="drop-section">
                    <ul class="drop-list">
                        <li class="drop-list-item">
                            <a
                                class="drop-button"
                                class:is-selected={$page.url.pathname.startsWith(
                                    `${projectPath}/overview`
                                )}
                                on:click={() => trackEvent('click_menu_overview')}
                                href={projectPath}
                                use:tooltip={{
                                    content: 'Overview',
                                    placement: 'right',
                                    disabled: !narrow
                                }}>
                                <span class="icon-chart-bar" aria-hidden="true" />
                                <span class="text">Overview</span>
                            </a>
                        </li>
                        <li class="drop-list-item">
                            <a
                                class="drop-button"
                                class:is-selected={$page.url.pathname.startsWith(
                                    `${projectPath}/auth`
                                )}
                                on:click={() => trackEvent('click_menu_auth')}
                                href={`${projectPath}/auth`}
                                use:tooltip={{
                                    content: 'Auth',
                                    placement: 'right',
                                    disabled: !narrow
                                }}>
                                <span class="icon-user-group" aria-hidden="true" />
                                <span class="text">Auth</span>
                            </a>
                        </li>
                        {#if $canSeeDatabases}
                            <li class="drop-list-item">
                                <a
                                    class="drop-button"
                                    class:is-selected={$page.url.pathname.startsWith(
                                        `${projectPath}/databases`
                                    )}
                                    on:click={() => trackEvent('click_menu_databases')}
                                    href={`${projectPath}/databases`}
                                    use:tooltip={{
                                        content: 'Databases',
                                        placement: 'right',
                                        disabled: !narrow
                                    }}>
                                    <span class="icon-database" aria-hidden="true" />
                                    <span class="text">Databases</span>
                                </a>
                            </li>
                        {/if}
                        <li class="drop-list-item">
                            <a
                                class="drop-button"
                                class:is-selected={$page.url.pathname.startsWith(
                                    `${projectPath}/functions`
                                )}
                                on:click={() => trackEvent('click_menu_functions')}
                                href={`${projectPath}/functions`}
                                use:tooltip={{
                                    content: 'Functions',
                                    placement: 'right',
                                    disabled: !narrow
                                }}>
                                <span class="icon-lightning-bolt" aria-hidden="true" />
                                <span class="text">Functions</span>
                            </a>
                        </li>
                        <li class="drop-list-item">
                            <a
                                class="drop-button"
                                class:is-selected={$page.url.pathname.startsWith(
                                    `${projectPath}/messaging`
                                )}
                                on:click={() => trackEvent('click_menu_messaging')}
                                href={`${projectPath}/messaging`}
                                use:tooltip={{
                                    content: 'Messaging',
                                    placement: 'right',
                                    disabled: !narrow
                                }}>
                                <span class="icon-send" aria-hidden="true" />
                                <span class="text">Messaging</span>
                            </a>
                        </li>
                        <li class="drop-list-item">
                            <a
                                class="drop-button"
                                class:is-selected={$page.url.pathname.startsWith(
                                    `${projectPath}/storage`
                                )}
                                on:click={() => trackEvent('click_menu_storage')}
                                href={`${projectPath}/storage`}
                                use:tooltip={{
                                    content: 'Storage',
                                    placement: 'right',
                                    disabled: !narrow
                                }}>
                                <span class="icon-folder" aria-hidden="true" />
                                <span class="text">Storage</span>
                            </a>
                        </li>
                        <li class="drop-list-item">
                            <a
                                class="drop-button"
                                class:is-selected={$page.url.pathname.startsWith(
                                    `${projectPath}/sites`
                                )}
                                on:click={() => trackEvent('click_menu_storage')}
                                href={`${projectPath}/sites`}
                                use:tooltip={{
                                    content: 'Sites',
                                    placement: 'right',
                                    disabled: !narrow
                                }}>
                                <span class="icon-globe-alt" aria-hidden="true" />
                                <span class="text">Sites</span>
                                <span class="badge">New</span>
                            </a>
                        </li>
                        <li class="drop-list-item is-not-desktop">
                            <a
                                class="drop-button"
                                href={`${projectPath}/settings`}
                                on:click={() => trackEvent('click_menu_settings')}
                                class:is-selected={$page.url.pathname.startsWith(
                                    `${projectPath}/settings`
                                )}
                                title="Settings"
                                use:tooltip={{
                                    content: 'Settings',
                                    placement: 'right',
                                    disabled: !narrow
                                }}>
                                <span class="icon-cog" aria-hidden="true" />
                                <span class="text">Settings</span>
                            </a>
                        </li>
                    </ul>
                </section>
            </div>

            <div class="side-nav-bottom">
                <section class="drop-section">
                    <a
                        class="drop-button is-only-desktop"
                        href={`${projectPath}/settings`}
                        on:click={() => trackEvent('click_menu_settings')}
                        class:is-selected={$page.url.pathname.startsWith(`${projectPath}/settings`)}
                        title="Settings"
                        use:tooltip={{
                            content: 'Settings',
                            placement: 'right',
                            disabled: !narrow
                        }}>
                        <span class="icon-cog" aria-hidden="true" />
                        <span class="text">Settings</span>
                    </a>

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
            <button
                class="side-nav-button button is-small is-secondary is-not-mobile"
                aria-label="resize menu"
                on:click={() => (narrow = !narrow)}
                use:tooltip={{
                    content: isMac() ? '⌥ + S' : 'Alt + S'
                }}>
                <span
                    class:icon-cheveron-right={narrow}
                    class:icon-cheveron-left={!narrow}
                    aria-hidden="true" />
            </button>
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

    .badge {
        background-color: hsl(calc(343 - 3) 79% 48%);
        color: white;
        padding: 4px 6px;
        border-radius: 0.25rem;
        font-size: 12px;
    }

    .drop-button {
        align-items: center;
    }
</style>
