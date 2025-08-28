<script lang="ts">
    import { Layout, Card } from '@appwrite.io/pink-svelte';
    export let gap: 'none' | 'xxxs' | 'xxs' | 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl' | 'xxxl' = 'l';
</script>

<Card.Base>
    <Layout.Stack {gap}>
        <slot />
    </Layout.Stack>
</Card.Base>
