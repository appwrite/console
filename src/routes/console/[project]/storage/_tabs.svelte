<script>
    import { base } from '$app/paths';

    import { page } from '$app/stores';

    $: project = $page.params.project;
</script>

<ul class="tabs">
    <li class="tabs-item">
        <a
            class="tabs-button is-selected"
            href={`${base}/console/${project}/storage`}
            class:is-selected={$page.url.pathname === `${base}/console/${project}/storage`}>
            <span class="text">Buckets</span>
        </a>
    </li>
    <li class="tabs-item">
        <a
            class="tabs-button is-selected"
            href={`${base}/console/${project}/storage/usage`}
            class:is-selected={$page.url.pathname === `${base}/console/${project}/storage/usage`}>
            <span class="text">Usage</span>
        </a>
    </li>
</ul>
