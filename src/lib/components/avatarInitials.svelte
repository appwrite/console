<script lang="ts">
    import { sdk } from '$lib/stores/sdk';
    import type { ComponentProps } from 'svelte';
    import Avatar from './avatar.svelte';

    type AvatarProps = ComponentProps<Avatar>;

    export let name: string;
    export let size: AvatarProps['size'] = 'm';
    export let background: string | undefined = undefined;

    $: src = sdk.forConsole.avatars.getInitials(name, 192, 192, background).toString();
</script>

<Avatar alt={name} {size} {src} />
