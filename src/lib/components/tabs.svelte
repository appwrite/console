<script lang="ts">
    import { Tabs } from '@appwrite.io/pink-svelte';

    export let variant: 'primary' | 'secondary' = 'primary';
    export let stretch: boolean | undefined = undefined;
</script>

<Tabs.Root {variant} {stretch} let:root>
    <slot {root} />
</Tabs.Root>
