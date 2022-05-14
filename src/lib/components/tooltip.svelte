<script lang="ts">
    export let icon = 'info';
    export let aria = 'info';
</script>

<button class="tooltip" aria-label={aria}>
    <span class={`icon-${icon}`} aria-hidden="true" />
    <span class="tooltip-popup" role="tooltip">
        <slot />
    </span>
</button>
