<script lang="ts">
    import LL from '$i18n/i18n-svelte';
    import { Code } from '$lib/components';
    import { WizardStep } from '$lib/layout';
    import { versions } from '../store';

    const example1 = `dependencies:
  appwrite: ^${$versions['client-flutter']}`;
    const example2 = `flutter pub add appwrite`;
</script>

<WizardStep>
    <svelte:fragment slot="title"
        >{$LL.console.project.forms.overview.title.getSdk()}</svelte:fragment>

    <p>{$LL.console.project.forms.overview.texts.addProjectFlutter()}</p>
    <Code label="YAML" language="yml" code={example1} withCopy />
    <p class="common-section">
        {$LL.console.project.forms.overview.texts.installDartPackage()}
    </p>
    <Code label="Bash" language="sh" code={example2} withCopy />
</WizardStep>
