<script lang="ts">
    import { Box, CardGrid, Heading } from '$lib/components';
    import { Button } from '$lib/elements/forms';

    async function downloadPdf() {
        const baseUrl = window.location.origin;
        const response = await fetch(`${baseUrl}/Appwrite_DPA.pdf`);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'Appwrite_DPA.pdf';
        link.click();
    }
</script>

<CardGrid>
    <div>
        <Heading tag="h6" size="7">Download DPA document</Heading>
    </div>
    <p class="text">
        After downloading, have the DPA signed by your organization's compliance authority (e.g.,
        CEO or Compliance Manager) and submit it to privacy@appwrite.io.
    </p>
    <svelte:fragment slot="aside">
        <Box>
            <h6>
                <b>DPA document (Data Processing Agreement)</b>
            </h6>
            <p class="text u-margin-block-start-8">
                Legal document outlining the terms and conditions under which personal data is
                processed.
            </p>
            <Button
                secondary
                class="u-margin-block-start-16"
                on:click={downloadPdf}
                event="download_dpa">
                <span class="icon-download" aria-hidden="true" />
                <span class="text">Download</span>
            </Button>
        </Box>
    </svelte:fragment>
</CardGrid>
