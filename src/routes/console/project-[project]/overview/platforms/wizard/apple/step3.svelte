<script lang="ts">
    import { Alert, Code } from '$lib/components';
    import { WizardStep } from '$lib/layout';
    import { Mode, MODE } from '$lib/system';
    import { sdk } from '$lib/stores/sdk';
    import LL from '$i18n/i18n-svelte';

    const { endpoint, project } = sdk.forProject.client.config;
    const code = `import Appwrite

let client = Client()
    .setEndpoint("${endpoint}")
    .setProject("${project}")
    .setSelfSigned(status: true) // For self signed certificates, only use for development`;

    let showAlert = true;
</script>

<WizardStep>
    <svelte:fragment slot="title"
        >{$LL.console.project.forms.overview.title.coding()}</svelte:fragment>

    <h2 class="heading-level-7">{$LL.console.project.forms.overview.title.initSdk()}</h2>
    <p>
        {$LL.console.project.forms.overview.texts.initSdk()}
    </p>
    <Code label="Apple SDK" labelIcon="apple" language="swift" {code} withCopy withLineNumbers />
    <p>
        {$LL.console.project.forms.overview.texts.apiCall()}
    </p>
    {#if showAlert}
        <div class="common-section">
            <Alert
                type="info"
                dismissible={MODE === Mode.CLOUD}
                on:dismiss={() => (showAlert = false)}>
                <svelte:fragment slot="title"
                    >{$LL.console.project.forms.overview.title.selfHosted()}</svelte:fragment>
                {$LL.console.project.forms.overview.texts.alert()}
            </Alert>
        </div>
    {/if}
</WizardStep>
