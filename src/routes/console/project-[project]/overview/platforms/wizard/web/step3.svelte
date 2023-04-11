<script lang="ts">
    import { Code } from '$lib/components';
    import { WizardStep } from '$lib/layout';
    import { sdk } from '$lib/stores/sdk';

    const { endpoint, project } = sdk.forProject.client.config;
    const code = `const client = new Client();

client
    .setEndpoint('${endpoint}')
    .setProject('${project}');`;
</script>

<WizardStep>
    <svelte:fragment slot="title">Initialize SDK</svelte:fragment>

    <h2 class="heading-level-7">Initialize your SDK</h2>
    <p>
        Initialize your SDK by pointing the client to your Appwrite project using your
        <!-- TODO: insert ID here -->
    </p>
    <Code label="Web SDK" labelIcon="code" language="js" {code} withCopy withLineNumbers />
</WizardStep>
