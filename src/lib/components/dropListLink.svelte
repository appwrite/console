<script lang="ts">
    import { clickOnEnter } from '$lib/helpers/a11y';

    export let href: string;
    export let icon: string = null;
</script>

<li class="drop-list-item" on:click on:keyup={clickOnEnter}>
    <a {href} class="drop-button">
        <span class="text"><slot /></span>
        {#if icon}
            <span class={`icon-${icon}`} aria-hidden="true" />
        {/if}
    </a>
</li>
