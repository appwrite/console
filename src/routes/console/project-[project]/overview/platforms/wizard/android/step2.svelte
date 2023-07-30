<script lang="ts">
    import LL from '$i18n/i18n-svelte';
    import { Code } from '$lib/components';
    import { WizardStep } from '$lib/layout';
    import { versions } from '../store';

    const example1 = `repositories {
    mavenCentral()
}`;
    const example2 = `implementation("io.appwrite:sdk-for-android:${$versions['client-android']}")`;
</script>

<WizardStep>
    <svelte:fragment slot="title"
        >{$LL.console.project.forms.overview.title.getSdk()}</svelte:fragment>
    <p>{$LL.console.project.forms.overview.texts.android.first()}</p>
    <Code label="Groovy" labelIcon="android" language="kotlin" code={example1} withCopy />
    <p class="common-section">{$LL.console.project.forms.overview.texts.android.second()}</p>
    <Code label="Groovy" labelIcon="android" language="kotlin" code={example2} withCopy />
</WizardStep>
