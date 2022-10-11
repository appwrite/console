<script lang="ts">
    export let selected = false;
    export let href: string = null;
</script>

<li class="tabs-item">
    {#if href}
        <a class="tabs-button" {href} class:is-selected={selected}>
            <span class="text"><slot /></span>
        </a>
    {:else}
        <button class="tabs-button" on:click class:is-selected={selected}>
            <span class="text"><slot /></span>
        </button>
    {/if}
</li>
