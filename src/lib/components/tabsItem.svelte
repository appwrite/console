<script>
    import { page } from '$app/stores';

    export let href;
</script>

<li class="tabs-item">
    <a class="tabs-button is-selected" {href} class:is-selected={$page.url.pathname === href}>
        <span class="text"><slot /></span>
    </a>
</li>
