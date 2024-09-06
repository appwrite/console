<script lang="ts">
    import { Layout } from '@appwrite.io/pink-svelte';

    export let isCommonSection = false;
    export let gap = null;
    let classes = '';
    export { classes as class };
</script>

<Layout.Stack gap="l">
    <slot />
</Layout.Stack>
