<script lang="ts">
    import InputSelect from '$lib/elements/forms/inputSelect.svelte';
    export let localeCodes: any[];
    export let value: string;
</script>

<InputSelect
    on:change
    label="Language"
    id="language"
    bind:value
    options={[
        ...localeCodes.map((code) => ({
            label: code.name,
            value: code.code
        }))
    ]} />
