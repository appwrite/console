<script lang="ts">
    import { sdk } from '$lib/stores/sdk';
    import Avatar from './avatar.svelte';

    export let name: string;
    export let size: number;
    export let background: string | undefined = undefined;
    export let color = 'black';

    $: src = sdk.forConsole.avatars.getInitials(name, size * 2, size * 2, background);
</script>

<Avatar {name} {size} {src} {color} />
