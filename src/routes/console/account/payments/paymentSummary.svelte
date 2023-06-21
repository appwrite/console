<script lang="ts">
    import { Box, CardGrid, Heading } from '$lib/components';
    import { VARS } from '$lib/system';
</script>

<CardGrid>
    <Heading tag="h2" size="6">Payment Summary</Heading>

    <p class="text">An overview of your upcoming payments.</p>
    <svelte:fragment slot="aside">
        <Box>
            <svelte:fragment slot="title">
                <h6 class="u-bold u-trim-1">PLACEHOLDER PLAN</h6>
            </svelte:fragment>
            <p class="u-trim-1">X projects</p>
        </Box>
        {#if VARS.CONSOLE_TIER && VARS.CONSOLE_TIER !== 'base'}
            <div class="u-flex">
                <p class="u-bold">Next billing data</p>
                <p class="text u-margin-inline-start-auto">XX DATE</p>
            </div>
        {/if}
    </svelte:fragment>
</CardGrid>
