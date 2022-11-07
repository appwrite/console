<script lang="ts">
    export let href: string;
    export let disabled = false;
</script>

<li class="drop-tabs-item">
    {#if disabled}
        <button class="drop-tabs-button" disabled>
            <span class="text"><slot /></span>
        </button>
    {:else}
        <a class="drop-tabs-button" {href}>
            <span class="text"><slot /></span>
        </a>
    {/if}
</li>
