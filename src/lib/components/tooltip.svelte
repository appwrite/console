<script lang="ts">
    export let icon = 'info';
    export let aria = 'info';
    export let disabled = false;
</script>

<button class="tooltip" aria-label={aria}>
    <span class:u-opacity-0-2={disabled} class={`icon-${icon}`} aria-hidden="true" />
    <span class="tooltip-popup" role="tooltip">
        <slot />
    </span>
</button>
