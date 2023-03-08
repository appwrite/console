<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { trackEvent } from '$lib/actions/analytics';

    $: project = $page.params.project;
    $: path = `${base}/console/project-${project}`;

    let narrow = true;
</script>

<div class="side-nav">
    <div class="side-nav-level-1" class:is-narrow={narrow}>
        {#if project}
            <div class="side-nav-main">
                <section class="drop-section">
                    <ul class="drop-list">
                        <li class="drop-list-item">
                            <a
                                class="drop-button"
                                class:is-selected={$page.url.pathname.startsWith(
                                    `${path}/overview`
                                )}
                                on:click={() => trackEvent('click_menu_overview')}
                                href={path}>
                                <span class="icon-chart-bar" aria-hidden="true" />
                                <span class="text">Overview</span>
                            </a>
                        </li>
                        <li class="drop-list-item">
                            <a
                                class="drop-button"
                                class:is-selected={$page.url.pathname.startsWith(`${path}/auth`)}
                                on:click={() => trackEvent('click_menu_auth')}
                                href={`${path}/auth`}>
                                <span class="icon-user-group" aria-hidden="true" />
                                <span class="text">Auth</span>
                            </a>
                        </li>
                        <li class="drop-list-item">
                            <a
                                class="drop-button"
                                class:is-selected={$page.url.pathname.startsWith(
                                    `${path}/databases`
                                )}
                                on:click={() => trackEvent('click_menu_databases')}
                                href={`${path}/databases`}>
                                <span class="icon-database" aria-hidden="true" />
                                <span class="text">Databases</span>
                            </a>
                        </li>
                        <li class="drop-list-item">
                            <a
                                class="drop-button"
                                class:is-selected={$page.url.pathname.startsWith(
                                    `${path}/functions`
                                )}
                                on:click={() => trackEvent('click_menu_functions')}
                                href={`${path}/functions`}>
                                <span class="icon-lightning-bolt" aria-hidden="true" />
                                <span class="text">Functions</span>
                            </a>
                        </li>
                        <li class="drop-list-item">
                            <a
                                class="drop-button"
                                class:is-selected={$page.url.pathname.startsWith(`${path}/storage`)}
                                on:click={() => trackEvent('click_menu_storage')}
                                href={`${path}/storage`}>
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
                        href={`${path}/settings`}
                        on:click={() => trackEvent('click_menu_settings')}
                        class:is-selected={$page.url.pathname.startsWith(`${path}/settings`)}>
                        <span class="icon-cog" aria-hidden="true" />
                        <span class="text">Settings</span>
                    </a>
                </section>
            </div>
        {/if}
        <button
            class="side-nav-button button is-small is-secondary is-not-mobile"
            aria-label="resize menu"
            on:click={() => (narrow = !narrow)}>
            <span
                class:icon-cheveron-right={narrow}
                class:icon-cheveron-left={!narrow}
                aria-hidden="true" />
        </button>
    </div>

    <div class="side-nav-level-2 is-open">
        <div class="side-nav-main">
            <section class="drop-section u-flex-vertical u-gap-8">
                <button
                    class="u-flex u-cross-center u-sep-block-end u-padding-block-12 is-not-desktop"
                    id="aaa">
                    <span class="icon-cheveron-left" aria-hidden="true" />
                    <span class="eyebrow-heading-3 u-margin-inline-auto">Databases</span>
                </button>
                <h5 class="eyebrow-heading-3 u-padding-block-12">Header</h5>
                <button class="button is-text is-full-width u-main-start u-padding-inline-0">
                    <span class="icon-plus" aria-hidden="true" />
                    <span class="text">Button</span>
                </button>
                <ul class="drop-list">
                    <li class="drop-list-item">
                        <a class="drop-button is-selected" href="/">
                            <span class="text">Home</span>
                        </a>
                    </li>
                    <li class="drop-list-item">
                        <a class="drop-button" href="">
                            <span class="text">Database</span>
                        </a>
                    </li>
                    <li class="drop-list-item">
                        <a class="drop-button" href="/settings.html">
                            <span class="text">Storage</span>
                        </a>
                    </li>

                    <li class="drop-list-item">
                        <a class="drop-button" href="/users.html">
                            <span class="text">Users</span>
                        </a>
                    </li>

                    <li class="drop-list-item">
                        <a class="drop-button" href="">
                            <span class="text">Functions</span>
                        </a>
                    </li>
                </ul>
            </section>
        </div>
    </div>
</div>

<style>
    .side-nav {
        z-index: 9999;
    }
</style>
