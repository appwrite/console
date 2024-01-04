<script lang="ts">
    import { Box, CardGrid, Heading } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { sdk } from '$lib/stores/sdk';
    import { Submit, trackEvent } from '$lib/actions/analytics';

    async function downloadPdf() {
        trackEvent(Submit.DownloadDPA);

        const today = new Date().toISOString();
        const prefs = await sdk.forConsole.account.getPrefs();
        const newPrefs = { ...prefs, DPA: today };
        sdk.forConsole.account.updatePrefs(newPrefs);

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
        After downloading, have the DPA signed by your organization's compliance authority, such as your CEO or Compliance Manager, and submit it to privacy@appwrite.io.
    </p>
    <svelte:fragment slot="aside">
        <Box>
            <h6>
                <b>Data Processing Agreement (DPA) document</b>
            </h6>
            <p class="text u-margin-block-start-8">
              The DPA is a legal document that describes the roles and responsibilities of Appwrite and the organization when personal data is processed. Learn more about the DPA.
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
