<script lang="ts">
    import { Card, Empty, Layout } from '@appwrite.io/pink-svelte';
    import { Button } from '$lib/elements/forms';
    import { queries } from './filters';

    export let resource: string;
</script>

<Card.Base padding="none">
    <Empty
        title={`Sorry, we couldn't find any ${resource}`}
        description={`There are no ${resource} that match your filters.`}
        type="secondary">
        <svelte:fragment slot="actions">
            <Layout.Stack direction="row" justifyContent="center">
                <Button
                    secondary
                    on:click={() => {
                        queries.clearAll();
                        queries.apply();
                    }}>
                    Clear filters
                </Button>
                <slot />
            </Layout.Stack>
        </svelte:fragment>
    </Empty>
</Card.Base>
