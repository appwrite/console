<script lang="ts">
    export let href: string;
    export let disabled = false;
</script>

<li class="secondary-tabs-item">
    {#if href}
        {#if disabled}
            <button class="secondary-tabs-button" disabled>
                <span class="text"><slot /></span>
            </button>
        {:else}
            <a class="secondary-tabs-button" {href}>
                <span class="text"><slot /></span>
            </a>
        {/if}
    {:else}
        <button class="secondary-tabs-button" {disabled} on:click>
            <span class="text"><slot /></span>
        </button>
    {/if}
</li>
