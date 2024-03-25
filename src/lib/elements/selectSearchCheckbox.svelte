<script lang="ts">
    // export let data: string[] = [];
    export let value = false;
</script>

<li class="drop-list-item">
    <button
        class="drop-button u-flex u-cross-center u-gap-12"
        on:click|preventDefault
        type="button">
        <input type="checkbox" class="is-small" bind:checked={value} />
        <slot />
    </button>
</li>
