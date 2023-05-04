<script lang="ts">
    import { InputSelectSearch } from '$lib/elements/forms';
    import type { Models } from '@appwrite.io/console';

    export let localeCodes: Models.LocaleCode[];
    export let value: string = 'en-us';

    let search: string = 'English';

    $: options =
        localeCodes
            ?.map((code) => ({
                label: code.name,
                value: code.code
            }))
            ?.filter((option) => option.label?.toLowerCase().startsWith(search?.toLowerCase())) ??
        [];
</script>

<div class="u-flex u-gap-16">
    <div class="u-un-break-text">
        <span class="icon-translate" />
        <span class="text">Template language</span>
    </div>
    <InputSelectSearch
        on:select
        label="Language"
        id="language"
        placeholder="Select a language"
        name="locale"
        bind:value
        bind:search
        required
        fullWidth
        stretch={false}
        showLabel={false}
        interactiveOutput
        {options} />
</div>
