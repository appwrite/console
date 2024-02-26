<script lang="ts">
    import { Code } from '$lib/components';
    import { WizardStep } from '$lib/layout';
    import { versions } from '../store';

    const example1 = `repositories {
    mavenCentral()
}`;
    const example2 = `implementation("io.appwrite:sdk-for-android:${$versions['client-android']}")`;
</script>

<WizardStep>
    <svelte:fragment slot="title">Install</svelte:fragment>
    <p>First, add this to your root level <code class="inline-code">build.gradle</code> file.</p>
    <Code label="Groovy" labelIcon="android" language="kotlin" code={example1} withCopy />
    <p class="common-section">And add this to your project's build.gradle file.</p>
    <Code label="Groovy" labelIcon="android" language="kotlin" code={example2} withCopy />
</WizardStep>
