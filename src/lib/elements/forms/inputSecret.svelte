<script lang="ts">
    import type { ComponentType } from 'svelte';
    import { Input } from '@appwrite.io/pink-svelte';

    export let id: string;
    export let label: string = '';
    export let value = '';
    export let placeholder = '';
    export let leadingIcon: ComponentType | undefined = undefined;
</script>

<Input.Password {id} {label} {value} {placeholder} {leadingIcon} readonly />
