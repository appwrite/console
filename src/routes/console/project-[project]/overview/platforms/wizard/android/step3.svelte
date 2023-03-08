<script lang="ts">
    import { Code } from '$lib/components';
    import { WizardStep } from '$lib/layout';
    import { sdk, sdkForProject } from '$lib/stores/sdk';

    const { endpoint, project } = sdkForProject().client.config;
    const code = `import io.appwrite.Client
import io.appwrite.services.Account

val client = Client(context)
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
    <Code
        label="Android SDK"
        labelIcon="android"
        language="kotlin"
        {code}
        withCopy
        withLineNumbers />
</WizardStep>
