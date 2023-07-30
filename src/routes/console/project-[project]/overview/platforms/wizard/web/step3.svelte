<script lang="ts">
    import LL from '$i18n/i18n-svelte';
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
    <svelte:fragment slot="title"
        >{$LL.console.project.forms.overview.title.coding()}</svelte:fragment>

    <h2 class="heading-level-7">{$LL.console.project.forms.overview.title.initSdk()}</h2>
    <p>
        {$LL.console.project.forms.overview.texts.initSdk()}
    </p>
    <Code label="Web SDK" labelIcon="code" language="js" {code} withCopy withLineNumbers />
</WizardStep>
