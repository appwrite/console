<script lang="ts">
    import { Code } from '$lib/components';
    import { WizardStep } from '$lib/layout';

    const example = `npx expo install react-native-appwrite react-native-url-polyfill`;
</script>

<WizardStep>
    <svelte:fragment slot="title">Install</svelte:fragment>

    <p>Install the Appwrite SDK for React Native and required dependencies.</p>
    <Code label="Bash" language="sh" code={example} withCopy />
</WizardStep>
