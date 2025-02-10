<script lang="ts">
    import { Tabs } from '@appwrite.io/pink-svelte';

    export let variant: 'primary' | 'secondary' = 'primary';
</script>

<Tabs.Root {variant} let:root>
    <slot {root} />
</Tabs.Root>
