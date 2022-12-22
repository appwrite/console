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
    import { isString } from '$lib/helpers/type';

    $wizard.media = $app.themeInUse === 'dark' ? Dark : Light;

    const projectId = $page.params.project;

    async function beforeSubmit() {
        if (!isString(projectId) || !isString($createPlatform.name)) return;
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
            undefined,
            undefined,
            $createPlatform.hostname
        );

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
            id="hostname"
            label="Package Name"
            placeholder="com.company.appname"
            tooltip="Your package name is generally the applicationId in your app-level build.gradle file."
            required
            bind:value={$createPlatform.hostname} />
    </FormList>
</WizardStep>
