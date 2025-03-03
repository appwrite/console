<script lang="ts">
    import { Box, CardGrid } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import BaaModal from './BAAModal.svelte';

    let show = false;
</script>

<CardGrid>
    <svelte:fragment slot="title">BAA</svelte:fragment>
    After requesting a BAA, we will contact you via email for the next steps.
    <svelte:fragment slot="aside">
        <Box>
            <h6>
                <b>Business Associate Agreement (BAA)</b>
            </h6>
            <p class="text u-margin-block-start-8">
                A Business Associate Agreement (BAA) is a HIPAA-required document ensuring outside
                services handling patient information for a healthcare organization follow privacy
                rules.
            </p>
            <Button
                secondary
                external
                class="u-margin-block-start-16"
                on:click={() => (show = true)}
                event="request_baa">
                <span class="text">Request BAA</span>
            </Button>
        </Box>
    </svelte:fragment>
</CardGrid>

<BaaModal bind:show />
