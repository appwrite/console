<script lang="ts">
    import { InputSelectSearch } from '$lib/elements/forms';

    export let localeCodes: { name: string; code: string }[];
    export let value: string;

    let search: string;

    $: options = localeCodes
        .map((code) => ({
            label: code.name,
            value: code.code
        }))
        .filter((option) => option.label?.toLowerCase().startsWith(search?.toLowerCase()));
</script>

<div class="u-flex u-main-space-between">
    <div>
        <span class="icon-translate" />
        <span class="text">{value}</span>
    </div>
    <InputSelectSearch
        on:select
        label="Language"
        id="language"
        placeholder="Select a language"
        name="locale"
        bind:value
        bind:search
        stretch={false}
        showLabel={false}
        interactiveOutput
        {options} />
</div>
