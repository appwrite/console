<script lang="ts">
    import { Code } from '$lib/components';
    import { WizardStep } from '$lib/layout';
    import { sdkForProject } from '$lib/stores/sdk';

    const { endpoint, project } = sdkForProject().client.config;
    const code = `const client = new Client();

client
    .setEndpoint('${endpoint}')
    .setProject('${project}');`;
</script>

<WizardStep>
    <svelte:fragment slot="title">Let's get coding</svelte:fragment>

    <h2 class="heading-level-7">Init your SDK</h2>
    <p>
        Now that you've downloaded the SDK, it's time to initialze it. Use your project ID, which
        can be found in your project settings page.
    </p>
    <Code label="Web SDK" labelIcon="code" language="js" {code} withCopy withLineNumbers />
</WizardStep>
