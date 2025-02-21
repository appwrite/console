<script lang="ts">
    import { page } from '$app/stores';
    import { WizardStep } from '$lib/layout';
    import { Code, Id } from '$lib/components';
    import { getProjectEndpoint } from '$lib/helpers/project';

    const project = $page.params.project;

    const code = `const client = new Client();
client
    .setEndpoint('${getProjectEndpoint()}')
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
