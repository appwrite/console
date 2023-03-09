<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { trackEvent } from '$lib/actions/analytics';
    import { slide } from '$lib/helpers/transition';

    $: project = $page.params.project;
    $: projectPath = `${base}/console/project-${project}`;

    $: secondSideNav = $page.data.secondSideNav;
    // We need to have this second variable, because we only want narrow
    // to change automatically if we change from having a second side nav to
    // not having one, not when the second side nav changes to a different value.
    $: hasSecondSideNav = !!secondSideNav;

    let narrow = false;
    $: {
        narrow = hasSecondSideNav;
    }
</script>

<div class="side-nav" class:hasSecondSideNav class:is-open-level-2={hasSecondSideNav}>
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
                                title="Overview">
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
                                title="Auth">
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
                                title="Databases">
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
                                title="Functions">
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
                                title="Storage">
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
                        title="Settings">
                        <span class="icon-cog" aria-hidden="true" />
                        <span class="text">Settings</span>
                    </a>
                </section>
            </div>
        {/if}

        {#if secondSideNav}
            <button
                class="side-nav-button button is-small is-secondary is-not-mobile"
                aria-label="resize menu"
                on:click={() => (narrow = !narrow)}>
                <span
                    class:icon-cheveron-right={narrow}
                    class:icon-cheveron-left={!narrow}
                    aria-hidden="true" />
            </button>
        {/if}
    </div>

    {#if secondSideNav}
        <div class="side-nav-level-2 is-open" transition:slide={{ axis: 'x', duration: 250 }}>
            <div class="side-nav-main">
                <svelte:component this={secondSideNav} />
            </div>
        </div>
    {/if}
</div>

<style>
    .side-nav {
        z-index: 9999;
    }
</style>
