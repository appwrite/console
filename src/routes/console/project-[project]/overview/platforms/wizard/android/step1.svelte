<script lang="ts">
    import { page } from '$app/stores';
    import { FormList, InputText } from '$lib/elements/forms';
    import { WizardStep } from '$lib/layout';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { createPlatform } from '../store';
    import { wizard } from '$lib/stores/wizard';
    import { app } from '$lib/stores/app';
    import Light from './light.svg';
    import Dark from './dark.svg';
    import { Submit, trackEvent } from '$lib/actions/analytics';

    $wizard.media = $app.themeInUse === 'dark' ? Dark : Light;

    const projectId = $page.params.project;

    async function beforeSubmit() {
        if ($createPlatform.$id) {
            await sdkForConsole.projects.updatePlatform(
                projectId,
                $createPlatform.$id,
                $createPlatform.name,
                $createPlatform.key,
                $createPlatform.store,
                $createPlatform.hostname
            );

            return;
        }

        const platform = await sdkForConsole.projects.createPlatform(
            projectId,
            'android',
            $createPlatform.name,
            $createPlatform.key,
            undefined,
            undefined
        );

        trackEvent(Submit.PlatformCreate, {
            type: 'android'
        });

        $createPlatform.$id = platform.$id;
    }
</script>

<WizardStep {beforeSubmit}>
    <svelte:fragment slot="title">Register your Android app</svelte:fragment>
    <FormList>
        <InputText
            id="name"
            label="Name"
            placeholder="My Android App"
            required
            bind:value={$createPlatform.name} />
        <InputText
            id="key"
            label="Package Name"
            placeholder="com.company.appname"
            tooltip="Your package name is generally the applicationId in your app-level build.gradle file."
            required
            bind:value={$createPlatform.key} />
    </FormList>
</WizardStep>
