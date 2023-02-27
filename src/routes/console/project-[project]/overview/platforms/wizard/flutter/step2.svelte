<script lang="ts">
    import { Code } from '$lib/components';
    import { WizardStep } from '$lib/layout';
    import { versions } from '../store';

    const example1 = `dependencies:
  appwrite: ^${$versions['client-flutter']}`;
    const example2 = `pub get appwrite`;
</script>

<WizardStep>
    <svelte:fragment slot="title">Get the SDK</svelte:fragment>

    <p>Add Appwrite SDK to your package's pubspec.yaml file. You can view an example here.</p>
    <div class="u-margin-block-start-16">
        <Code label="YAML" language="yml" code={example1} withCopy noMargin />
    </div>

    <p class="common-section">
        You can also install the SDK using the Dart package manager from your terminal:
    </p>
    <div class="u-margin-block-start-16">
        <Code label="Bash" language="sh" code={example2} withCopy noMargin />
    </div>
</WizardStep>
