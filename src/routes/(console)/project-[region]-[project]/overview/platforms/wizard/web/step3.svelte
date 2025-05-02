<script lang="ts">
    import { page } from '$app/state';
    import { Code } from '$lib/components';
    import { WizardStep } from '$lib/layout';
    import { getProjectEndpoint } from '$lib/helpers/project';

    const project = page.params.project;

    const code = `const client = new Client();
client
    .setEndpoint('${getProjectEndpoint()}')
    .setProject('${project}');`;
</script>

<WizardStep>
    <svelte:fragment slot="title">Initialize SDK</svelte:fragment>

    <p>Initialize your SDK by pointing the client to your Appwrite project.</p>

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
