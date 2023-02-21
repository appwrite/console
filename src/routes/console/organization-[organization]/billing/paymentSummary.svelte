<script lang="ts">
    import { Box, CardGrid, Heading } from '$lib/components';
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
    </svelte:fragment>
</CardGrid>
