<script lang="ts">
    import { page } from '$app/stores';
    import { isCloud } from '$lib/system';
    import { WizardStep } from '$lib/layout';
    import { createPlatform } from '../store';
    import { Alert, Code } from '$lib/components';
    import { getProjectEndpoint } from '$lib/helpers/project';

    const project = $page.params.project;
    const code = `import { Client, Account } from 'react-native-appwrite';

const client = new Client()
    .setEndpoint('${getProjectEndpoint()}')
    .setProject('${project}')
    .setPlatform('${$createPlatform.key}');
`;

    let showAlert = true;
</script>

<WizardStep>
    <svelte:fragment slot="title">Initialize</svelte:fragment>

    <p>Initialize your SDK by pointing the client to your Appwrite project.</p>

    <div class="u-margin-block-start-16">
        <Code
            label="React Native"
            labelIcon="code"
            language="js"
            {code}
            withCopy
            withLineNumbers
            noMargin />
    </div>
    <p class="common-section">
        Before sending any API calls to your new Appwrite project, make sure your device or emulator
        has network access to your Appwrite project's hostname or IP address.
    </p>
    {#if showAlert && !isCloud}
        <div class="common-section">
            <Alert type="info" on:dismiss={() => (showAlert = false)}>
                <svelte:fragment slot="title">For self-hosted solutions</svelte:fragment>
                When connecting to a locally hosted Appwrite project from an emulator or a mobile device,
                you should use the private IP of the device running your Appwrite project as the hostname
                of the endpoint instead of localhost. You can also use a service like ngrok to proxy
                the Appwrite server.
            </Alert>
        </div>
    {/if}
</WizardStep>
