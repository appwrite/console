<script lang="ts">
    import LL from '$i18n/i18n-svelte';
    import { Code } from '$lib/components';
    import { WizardStep } from '$lib/layout';
    import { sdk } from '$lib/stores/sdk';

    const { endpoint, project } = sdk.forProject.client.config;
    const code = `import io.appwrite.Client
import io.appwrite.services.Account

val client = Client(context)
    .setEndpoint("${endpoint}")
    .setProject("${project}")
    .setSelfSigned(status: true) // For self signed certificates, only use for development`;
</script>

<WizardStep>
    <svelte:fragment slot="title"
        >{$LL.console.project.forms.overview.title.coding()}</svelte:fragment>

    <h2 class="heading-level-7">{$LL.console.project.forms.overview.title.initSdk()}</h2>
    <p>
        {$LL.console.project.forms.overview.texts.initSdk()}
    </p>
    <Code
        label="Android SDK"
        labelIcon="android"
        language="kotlin"
        {code}
        withCopy
        withLineNumbers />
</WizardStep>
