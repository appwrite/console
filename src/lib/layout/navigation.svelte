<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { trackEvent } from '$lib/actions/analytics';
    import { tooltip } from '$lib/actions/tooltip';
    import { isMac } from '$lib/helpers/platform';
    import { slide } from '$lib/helpers/transition';

    $: project = $page.params.project;
    $: projectPath = `${base}/console/project-${project}`;

    $: subNavigation = $page.data.subNavigation;
    // We need to have this second variable, because we only want narrow
    // to change automatically if we change from having a second side nav to
    // not having one, not when the second side nav changes to a different value.
    $: hasSubNavigation = !!subNavigation;

    let narrow = false;
    $: {
        narrow = hasSubNavigation;
    }

    function handleKeyDown(event: KeyboardEvent) {
        // If Alt + S is pressed
        if (hasSubNavigation && event.altKey && event.keyCode === 83) {
            event.preventDefault();
            narrow = !narrow;
        }
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
                    </ul>
                </section>
            </div>

            <div class="side-nav-bottom">
                <section class="drop-section">
                    <a
                        class="drop-button"
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
        <div class="side-nav-level-2 is-open" transition:slide|local={{ axis: 'x', duration: 250 }}>
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
