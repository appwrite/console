<script>
    import { base } from '$app/paths';

    import { page } from '$app/stores';

    $: project = $page.params.project;
</script>

<div class="tabs">
    <button class="tabs-button-scroll is-start" aria-label="Show items in start side">
        <span class="icon-cheveron-left" aria-hidden="true" />
    </button>
    <button class="tabs-button-scroll is-end" aria-label="Show items in end side">
        <span class="icon-cheveron-right" aria-hidden="true" />
    </button>
    <ul class="tabs-list scroll-shadow-horizontal">
        <li class="tabs-item">
            <a
                class="tabs-button"
                href={`${base}/console/${project}/users`}
                class:is-selected={$page.url.pathname === `${base}/console/${project}/users`}>
                <span class="text">Users</span>
            </a>
        </li>
        <li class="tabs-item">
            <a
                class="tabs-button"
                href={`${base}/console/${project}/users/teams`}
                class:is-selected={$page.url.pathname === `${base}/console/${project}/users/teams`}>
                <span class="text">Teams</span>
            </a>
        </li>
        <li class="tabs-item">
            <a
                class="tabs-button"
                href={`${base}/console/${project}/users/authentication`}
                class:is-selected={$page.url.pathname ===
                    `${base}/console/${project}/users/authentication`}>
                <span class="text">Authentication</span>
            </a>
        </li>
        <li class="tabs-item">
            <a
                class="tabs-button"
                href={`${base}/console/${project}/users/usage`}
                class:is-selected={$page.url.pathname === `${base}/console/${project}/users/usage`}>
                <span class="text">Usage</span>
            </a>
        </li>
        <li class="tabs-item">
            <a
                class="tabs-button"
                href={`${base}/console/${project}/users/security`}
                class:is-selected={$page.url.pathname === `${base}/console/${project}/users/security`}>
                <span class="text">Security</span>
            </a>
        </li>
    </ul>
</div>
