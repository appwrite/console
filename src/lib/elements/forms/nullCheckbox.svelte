<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    export let checked = false;

    const dispatch = createEventDispatcher<{
        change: boolean;
    }>();

    const handleChange = (e: Event) => {
        const input = e.target as HTMLInputElement;
        dispatch('change', !!input.checked);
    };
</script>

<label class="u-flex u-cross-center u-gap-8 u-margin-inline-start-8">
    <input bind:checked on:change={handleChange} type="checkbox" class="is-small" />
    <span class="eyebrow-heading-3 u-x-small u-color-text-gray"> NULL </span>
</label>
