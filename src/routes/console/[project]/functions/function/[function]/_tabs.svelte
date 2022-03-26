<script>
    import { base } from '$app/paths';

    import { page } from '$app/stores';

    $: project = $page.params.project;
    $: functionId = $page.params.function;
    $: path = `${base}/console/${project}/functions/function/${functionId}`;
</script>

<ul class="tabs">
    <li class="tabs-item">
        <a class="tabs-button" href={path} class:is-selected={$page.url.pathname === path}>
            <span class="text">Overview</span>
        </a>
    </li>
    <li class="tabs-item">
        <a
            class="tabs-button"
            href={`${path}/monitors`}
            class:is-selected={$page.url.pathname === `${path}/monitors`}>
            <span class="text">Monitors</span>
        </a>
    </li>
    <li class="tabs-item">
        <a
            class="tabs-button"
            href={`${path}/logs`}
            class:is-selected={$page.url.pathname === `${path}/logs`}>
            <span class="text">Logs</span>
        </a>
    </li>
    <li class="tabs-item">
        <a
            class="tabs-button"
            href={`${path}/settings`}
            class:is-selected={$page.url.pathname === `${path}/settings`}>
            <span class="text">Settings</span>
        </a>
    </li>
</ul>
