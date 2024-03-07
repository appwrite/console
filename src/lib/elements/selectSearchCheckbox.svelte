<script lang="ts">
    // export let data: string[] = [];
    export let value: string;
    export let checked = false;
</script>

<div class="u-flex u-cross-baseline u-gap-12">
    <span
        class="u-flex-basis-140 u-flex-shrink-0 u-text-start u-trim-start u-x-small u-color-text-gray u-font-code"
        data-private>
        <input id={value} type="checkbox" bind:checked />
        <slot />
    </span>
</div>
