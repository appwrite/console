<script lang="ts">
    import { Avatar } from '@appwrite.io/pink-svelte';
    import type { AvatarProps } from '@appwrite.io/pink-svelte/dist/avatar/Avatar.svelte';

    export let size: AvatarProps['size'] = 'm';
    export let src: AvatarProps['src'];
    export let alt: AvatarProps['alt'];
</script>

<Avatar {alt} {src} {size} />
