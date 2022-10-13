<script lang="ts">
    import { Code } from '$lib/components';
    import { WizardStep } from '$lib/layout';
    import { versions } from '../store';

    const example1 = `dependencies:
  appwrite: ^${$versions['client-flutter']}`;
</script>

<WizardStep>
    <svelte:fragment slot="title">Get the SDK</svelte:fragment>

    <p>Add Appwrite SDK to your package's pubspec.yaml file. You can view an example here.</p>
    <Code label="YAML" language="yml" code={example1} showCopy />
    <p>You can also install the SDK using the Dart package manager from your terminal:</p>
    <Code label="Web SDK" language="js" code={`import { Appwrite } from 'appwrite';`} showCopy />
</WizardStep>
