<script lang="ts">
    export let value: string;
    export let group: string;
</script>

<li class="drop-list-item">
    <button
        class="drop-button u-flex u-cross-center u-gap-12"
        on:click|preventDefault
        type="button">
        <input type="radio" class="is-small" {value} bind:group />
        <slot />
    </button>
</li>
