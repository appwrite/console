<script lang="ts">
    import { Box } from '$lib/components';
    import { Input } from '@appwrite.io/pink-svelte';
    import { localeCodes } from './store';

    export let value = 'en';

    const options = $localeCodes?.map((code) => ({
        label: code.name,
        value: code.code
    }));
</script>

<Box radius="small" class="u-flex u-gap-16 u-cross-center">
    <div class="u-un-break-text is-not-mobile">
        <span class="icon-translate" />
        <span class="text">Template language</span>
    </div>
    <Input.Combobox
        on:select
        id="language"
        placeholder="Select a language"
        name="locale"
        bind:value
        required
        fullWidth
        stretch={false}
        showLabel={false}
        interactiveOutput
        {options} />
</Box>
