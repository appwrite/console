<script lang="ts">
    import { Alert, Code } from '$lib/components';
    import { WizardStep } from '$lib/layout';
    import { Mode, MODE } from '$lib/system';
    import { sdk } from '$lib/stores/sdk';
    import Id from '$lib/components/id.svelte';

    const { endpoint, project } = sdk.forProject.client.config;
    const code = `import 'package:appwrite/appwrite.dart';

Client client = Client();
client
    .setEndpoint('${endpoint}')
    .setProject('${project}')
    .setSelfSigned(status: true); // For self signed certificates, only use for development`;

    let showAlert = true;
</script>

<WizardStep>
    <svelte:fragment slot="title">Initialize SDK</svelte:fragment>

    <h2 class="heading-level-7">Initialize your SDK</h2>
    <p>
        Initialize your SDK by pointing the client to your Appwrite project using your <Id
            value={project}>Project ID</Id>
    </p>
    <Code label="Flutter SDK" labelIcon="flutter" language="dart" {code} withCopy withLineNumbers />
    <p class="common-section">
        Before sending any API calls to your new Appwrite project, make sure your device or emulator
        has network access to your Appwrite project's hostname or IP address.
    </p>
    {#if showAlert}
        <div class="common-section">
            <Alert
                type="info"
                dismissible={MODE === Mode.CLOUD}
                on:dismiss={() => (showAlert = false)}>
                <svelte:fragment slot="title">For self-hosted solutions</svelte:fragment>
                When connecting to a locally hosted Appwrite project from an emulator or a mobile device,
                you should use the private IP of the device running your Appwrite project as the hostname
                of the endpoint instead of localhost. You can also use a service like ngrok to proxy
                the Appwrite server.
            </Alert>
        </div>
    {/if}
</WizardStep>
