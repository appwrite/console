<script lang="ts">
    import InputSelect from '$lib/elements/forms/inputSelect.svelte';
</script>

<InputSelect
    label="Language"
    id="language"
    value="en_us"
    options={[
        {
            label: 'English',
            value: 'en_us'
        }
    ]} />
