<script lang="ts">
    import { Code } from '$lib/components';
    import { WizardStep } from '$lib/layout';
    import { versions } from '../store';

    const example1 = `repositories {
    mavenCentral()
}`;
</script>

<WizardStep>
    <svelte:fragment slot="title">Get the SDK</svelte:fragment>
    <p>First, add this to your root level build.gradle file:</p>
    <Code label="Groovy" language="kotlin" code={example1} withCopy />
    <p class="common-section">And add this to your project's build.gradle file:</p>
    <Code
        label="Groovy"
        labelIcon="android"
        language="kotlin"
        code={`implementation("io.appwrite:sdk-for-android:${versions['client-android']}")`}
        withCopy />
</WizardStep>
