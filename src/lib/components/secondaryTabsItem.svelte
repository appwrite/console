<script lang="ts">
    export let href: string = null;
    export let disabled = false;
    export let stretch = false;
    export let fullWidth = false;
    export let center = false;
</script>

<li class="secondary-tabs-item" class:u-stretch={stretch}>
    {#if href}
        {#if disabled}
            <button
                class="secondary-tabs-button"
                class:u-width-full-line={fullWidth}
                class:u-text-center={center}
                disabled>
                <span class="text"><slot /></span>
            </button>
        {:else}
            <a
                class="secondary-tabs-button"
                class:u-width-full-line={fullWidth}
                class:u-text-center={center}
                {href}>
                <span class="text"><slot /></span>
            </a>
        {/if}
    {:else}
        <button
            class="secondary-tabs-button"
            class:u-width-full-line={fullWidth}
            class:u-text-center={center}
            {disabled}
            on:click>
            <span class="text"><slot /></span>
        </button>
    {/if}
</li>
