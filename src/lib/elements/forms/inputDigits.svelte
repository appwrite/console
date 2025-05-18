<script lang="ts">
    import { Input } from '@appwrite.io/pink-svelte';

    export let length: number = 6;
    export let value: string = '';
    export let required = false;
    export let disabled = false;
    export let readonly = false;
    export let autofocus = false;
</script>

<Input.OTP {length} bind:value {required} {disabled} {readonly} {autofocus} size="s" />
