<script lang="ts">
    import { Input } from '@appwrite.io/pink-svelte';
    import { localeCodes } from './store';

    export let value = 'en';

    const options = $localeCodes?.map((code) => ({
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
