<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { trackEvent } from '$lib/actions/analytics';

    $: project = $page.params.project;
    $: path = `${base}/console/project-${project}`;
</script>

<div class="side-nav">
    {#if project}
        <div class="side-nav-main">
            <section class="drop-section">
                <ul class="drop-list">
                    <li class="drop-list-item">
                        <a
                            class="drop-button"
                            class:is-selected={$page.url.pathname.startsWith(`${path}/overview`)}
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
                            class:is-selected={$page.url.pathname.startsWith(`${path}/databases`)}
                            on:click={() => trackEvent('click_menu_databases')}
                            href={`${path}/databases`}>
                            <span class="icon-database" aria-hidden="true" />
                            <span class="text">Databases</span>
                        </a>
                    </li>
                    <li class="drop-list-item">
                        <a
                            class="drop-button"
                            class:is-selected={$page.url.pathname.startsWith(`${path}/functions`)}
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
</div>

<style>
    .side-nav {
        z-index: 9999;
    }
</style>
