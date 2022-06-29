<script lang="ts">
    import { InputSearch } from '$lib/elements/forms';

    export let search: string;
    export let placeholder: string;
</script>

<div class="u-flex u-gap-12 common-section u-main-space-between">
    <div class="u-flex-basis-50-percent">
        <InputSearch {placeholder} bind:value={search} />
    </div>
    <slot />
</div>
