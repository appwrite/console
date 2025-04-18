<script lang="ts">
    import { Box } from '.';
    import { Layout } from '@appwrite.io/pink-svelte';
</script>

<Box>
    <Layout.Stack direction="row" justifyContent="flex-start">
        <slot name="image" />
        <div>
            <slot name="title" />
            <slot />
        </div>
    </Layout.Stack>
</Box>
