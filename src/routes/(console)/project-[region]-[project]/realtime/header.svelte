<script lang="ts">
    import { Cover } from '$lib/layout';
    import { Typography } from '@appwrite.io/pink-svelte';
</script>

<Cover>
    <svelte:fragment slot="header">
        <Typography.Title color="--fgcolor-neutral-primary" size="xl">Realtime</Typography.Title>
    </svelte:fragment>
</Cover>
