<script lang="ts">
    import { Box, CardGrid, Heading } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import Soc2Modal from './Soc2Modal.svelte';

    let show = false;
</script>

<CardGrid>
    <div>
        <Heading tag="h6" size="7">SOC-2</Heading>
    </div>
    <p class="text">After requesting SOC-2, we will contact you via email for the next steps.</p>
    <svelte:fragment slot="aside">
        <Box>
            <h6>
                <b>Service Organization Control Type 2 (SOC-2)</b>
            </h6>
            <p class="text u-margin-block-start-8">
                SOC-2 is a framework for managing and protecting sensitive information, ensuring
                compliance with trust service criteria such as security, availability, processing
                integrity, confidentiality, and privacy.
            </p>
            <Button
                secondary
                external
                class="u-margin-block-start-16"
                on:click={() => (show = true)}
                event="request_soc-2">
                <span class="text">Request SOC-2</span>
            </Button>
        </Box>
    </svelte:fragment>
</CardGrid>

<Soc2Modal bind:show />
