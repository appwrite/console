<script lang="ts">
    import { Input } from '@appwrite.io/pink-svelte';
    import type { Models } from '@appwrite.io/console';

    export let value = 'en';
    export let localeCodes: Models.LocaleCode[];

    const options = localeCodes?.map((code) => ({
        label: code.name,
        value: code.code
    }));
</script>

<Input.ComboBox
    label="Template language"
    on:change
    id="language"
    placeholder="Select a language"
    name="locale"
    bind:value
    required
    {options} />
