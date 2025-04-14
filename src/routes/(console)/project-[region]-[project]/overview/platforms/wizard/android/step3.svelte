<script lang="ts">
    import { page } from '$app/stores';
    import { WizardStep } from '$lib/layout';
    import { Code } from '$lib/components';
    import { getProjectEndpoint } from '$lib/helpers/project';

    const project = $page.params.project;
    const code = `import io.appwrite.Client
import io.appwrite.services.Account

val client = Client(context)
    .setEndpoint("${getProjectEndpoint()}")
    .setProject("${project}")
    .setSelfSigned(status: true) // For self signed certificates, only use for development
`;
</script>

<WizardStep>
    <svelte:fragment slot="title">Initialize</svelte:fragment>
    <p>Initialize your SDK by pointing the client to your Appwrite project.</p>
    <div class="u-margin-block-start-16">
        <Code
            label="Android SDK"
            labelIcon="android"
            language="kotlin"
            {code}
            withCopy
            withLineNumbers
            noMargin />
    </div>
</WizardStep>
