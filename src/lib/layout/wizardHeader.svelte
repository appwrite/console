<script lang="ts">
    export let title: string;
    export let header: string = '';
    export let href: string = null;
</script>

<header class="wizard-header">
    <div class="body-text-1 u-bold">{title}</div>

    {#if header}
        {header}
    {:else}
        <slot name="header" />
    {/if}

    {#if href}
        <a
            class="button is-text is-only-icon u-margin-inline-start-auto"
            style="--button-size:1.5rem;"
            {href}
            aria-label="close wizard">
            <span class="icon-x" aria-hidden="true" />
        </a>
    {:else}
        <button
            class="button is-text is-only-icon u-margin-inline-start-auto"
            style="--button-size:1.5rem;"
            aria-label="close wizard"
            on:click>
            <span class="icon-x" aria-hidden="true" />
        </button>
    {/if}
</header>
