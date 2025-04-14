<script lang="ts">
    import { Box } from '$lib/components';
    import { InputSelectSearch } from '$lib/elements/forms';
    import { localeCodes } from './store';

    export let value = 'en';

    let search = 'English';

    $: options =
        $localeCodes
            ?.map((code) => ({
                label: code.name,
                value: code.code
            }))
            ?.filter((option) => option.label?.toLowerCase().startsWith(search?.toLowerCase())) ??
        [];
</script>

<Box radius="small" class="u-flex u-gap-16 u-cross-center">
    <div class="u-un-break-text is-not-mobile">
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
</Box>
