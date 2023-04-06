<script lang="ts">
    import { sdkForConsole } from '$lib/stores/sdk';
    import Avatar from './avatar.svelte';

    export let name: string;
    export let size: number;

    $: src = sdkForConsole.avatars.getInitials(name, size * 2, size * 2).toString();
</script>

<Avatar {name} {size} {src} />
