<script lang="ts">
    import { base } from '$app/paths';

    import { page } from '$app/stores';

    $: project = $page.params.project;
    $: path = `${base}/console/${project}`;
</script>

<div class="side-nav">
    {#if project}
        <div class="side-nav-main">
            <section class="drop-section">
                <ul class="drop-list">
                    <li class="drop-list-item">
                        <a
                            class="drop-button"
                            class:is-selected={$page.url.pathname === path}
                            href={path}>
                            <span class="icon-home" aria-hidden="true" />
                            <span class="text">Home</span>
                        </a>
                    </li>
                    <li class="drop-list-item">
                        <a
                            class="drop-button"
                            class:is-selected={$page.url.pathname.startsWith(`${path}/database`)}
                            href={`${path}/database`}>
                            <span class="icon-database" aria-hidden="true" />
                            <span class="text">Database</span>
                        </a>
                    </li>
                    <li class="drop-list-item">
                        <a
                            class="drop-button"
                            class:is-selected={$page.url.pathname.startsWith(`${path}/storage`)}
                            href={`${path}/storage`}>
                            <span class="icon-folder" aria-hidden="true" />
                            <span class="text">Storage</span>
                        </a>
                    </li>
                    <li class="drop-list-item">
                        <a
                            class="drop-button"
                            class:is-selected={$page.url.pathname.startsWith(`${path}/users`)}
                            href={`${path}/users`}>
                            <span class="icon-user-group" aria-hidden="true" />
                            <span class="text">Users</span>
                        </a>
                    </li>
                    <li class="drop-list-item">
                        <a
                            class="drop-button"
                            class:is-selected={$page.url.pathname.startsWith(`${path}/functions`)}
                            href={`${path}/functions`}>
                            <span class="icon-lightning-bolt" aria-hidden="true" />
                            <span class="text">Functions</span>
                        </a>
                    </li>
                    <li class="drop-list-item">
                        <a
                            class="drop-button"
                            class:is-selected={$page.url.pathname.startsWith(`${path}/webhooks`)}
                            href={`${path}/webhooks`}>
                            <span class="icon-link" aria-hidden="true" />
                            <span class="text">Webhooks</span>
                        </a>
                    </li>
                    <li class="drop-list-item">
                        <a
                            class="drop-button"
                            class:is-selected={$page.url.pathname.startsWith(`${path}/keys`)}
                            href={`${path}/keys`}>
                            <span class="icon-key" aria-hidden="true" />
                            <span class="text">API Keys</span>
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
