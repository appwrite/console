<script lang="ts">
    import { Avatar } from '@appwrite.io/pink-svelte';

    type AvatarProps = Partial<{
        src: string;
        alt: string;
        size: 'xs' | 's' | 'm' | 'l' | 'xl';
        empty: boolean;
    }>;

    export let size: AvatarProps['size'] = 'm';
    export let src: AvatarProps['src'] = undefined;
    export let alt: AvatarProps['alt'];
</script>

<Avatar {alt} {src} {size}>
    <slot />
</Avatar>
