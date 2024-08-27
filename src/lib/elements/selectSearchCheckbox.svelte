<script lang="ts">
    export let value = false;
    export let padding: number | null = null;
</script>

<li class="drop-list-item">
    <button
        class="drop-button u-flex u-cross-center u-gap-12"
        style:--button-padding-horizontal={padding ? `${padding / 16}rem` : ''}
        style:--button-padding-vertical={padding ? `${padding / 16}rem` : ''}
        on:click|preventDefault
        type="button">
        <input type="checkbox" class="is-small" bind:checked={value} />
        <slot />
    </button>
</li>
