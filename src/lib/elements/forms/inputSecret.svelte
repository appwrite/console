<script lang="ts">
    import { Input } from '@appwrite.io/pink-svelte';

    export let id: string;
    export let label: string = '';
    export let value = '';
    export let placeholder = '';
</script>

<Input.Password {id} {label} {value} {placeholder} readonly />
