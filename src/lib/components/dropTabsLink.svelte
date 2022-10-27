<script lang="ts">
    export let href: string;
    export let disabled = false;
</script>

<li class="drop-tabs-item">
    {#if disabled}
        <span class="drop-tabs-button is-disabled">
            <span class="text"><slot /></span>
        </span>
    {:else}
        <a class="drop-tabs-button" {href}>
            <span class="text"><slot /></span>
        </a>
    {/if}
</li>
