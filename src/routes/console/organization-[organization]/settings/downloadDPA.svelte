<script lang="ts">
    import { Box, CardGrid, Heading } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { sdk } from '$lib/stores/sdk';

    async function downloadPdf() {
        console.log('download pdf');
        const today = new Date().toISOString();
        const prefs = await sdk.forConsole.account.getPrefs();
        const newPrefs = { ...prefs, DPA: today };
        sdk.forConsole.account.updatePrefs(newPrefs);
    }
</script>

<CardGrid>
    <div>
        <Heading tag="h6" size="7">Download DPA document</Heading>
    </div>
    <p class="text">
        After downloading, have the DPA signed by your organization's compliance authority (e.g.,
        CEO or Compliance Manager) and submit it to <a
            class="link"
            href="mailto:privacy@appwrite.io">privacy@appwrite.io</a
        >.
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
                external
                class="u-margin-block-start-16"
                on:click={downloadPdf}
                href="/Appwrite_DPA.pdf"
                event="download_dpa">
                <span class="icon-download" aria-hidden="true" />
                <span class="text">Download</span>
            </Button>
        </Box>
    </svelte:fragment>
</CardGrid>
