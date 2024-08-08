<script lang="ts">
    import { Code } from '$lib/components';
    import Id from '$lib/components/id.svelte';
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
        Initialize your SDK by pointing the client to your Appwrite project using your <Id
            value={project}>Project ID</Id
        >.
    </p>
    <div class="u-margin-block-start-16">
        <Code
            label="Web SDK"
            labelIcon="code"
            language="js"
            {code}
            withCopy
            withLineNumbers
            noMargin />
    </div>
</WizardStep>
