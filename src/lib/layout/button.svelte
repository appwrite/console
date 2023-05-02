<script lang="ts">
    type Icon = {
        name: string;
        ariaLabel: string;
    };
    export let icon: Icon | undefined = undefined;
    // You could use CVA to handle sizes and other variants (https://github.com/joe-bell/cva)
    export let size: 'sm' | 'md' | 'lg' = 'md';
    export let disabled = false;
</script>

<!-- Be sure to forward all the event handlers you need -->
<button
    on:click
    on:blur
    on:keydown
    on:keyup
    on:focus
    aria-label={icon.ariaLabel ?? undefined}
    class="button button-{size}"
    {disabled}>
    {#if icon}
        <!-- This is just a mock implementation, you'd probably use svgs or a lib here -->
        <i class="icon-{icon.name}" />
    {:else}
        <slot />
    {/if}
</button>

<style>
    button {
    }

    /* States */
    button:hover {
    }
    button:active {
    }
    button:focus {
    }
    button:disabled {
    }

    /* Sizes */
    .button-sm {
    }
    .button-md {
    }
    .button-lg {
    }
</style>
