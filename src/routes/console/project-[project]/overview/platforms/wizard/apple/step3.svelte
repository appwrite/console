<script lang="ts">
    import { Alert, Code } from '$lib/components';
    import { WizardStep } from '$lib/layout';
    import { sdk } from '$lib/stores/sdk';

    const { endpoint, project } = sdk.forProject.client.config;
    const code = `import Appwrite

let client = Client()
    .setEndpoint("${endpoint}")
    .setProject("${project}")
    .setSelfSigned(status: true) // For self signed certificates, only use for development`;
</script>

<WizardStep>
    <svelte:fragment slot="title">Let's get coding</svelte:fragment>

    <h2 class="heading-level-7">Init your SDK</h2>
    <p>
        Now that you've downloaded the SDK, it's time to initialze it. Use your project ID, which
        can be found in your project settings page.
    </p>
    <Code label="Apple SDK" labelIcon="apple" language="swift" {code} withCopy withLineNumbers />
    <p>
        Before sending any API calls to your new Appwrite project, make sure your device or emulator
        has network access to your Appwrite project's hostname or IP address.
    </p>
    <div class="common-section">
        <Alert type="info">
            <svelte:fragment slot="title">For self-hosted solutions</svelte:fragment>
            When connecting to a locally hosted Appwrite project from an emulator or a mobile device,
            you should use the private IP of the device running your Appwrite project as the hostname
            of the endpoint instead of localhost. You can also use a service like ngrok to proxy the
            Appwrite server.
        </Alert>
    </div>
</WizardStep>
