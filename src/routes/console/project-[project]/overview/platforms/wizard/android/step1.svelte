<script lang="ts">
    import { page } from '$app/stores';
    import { FormList, InputText } from '$lib/elements/forms';
    import { WizardStep } from '$lib/layout';
    import { sdk } from '$lib/stores/sdk';
    import { createPlatform } from '../store';
    import { Submit, trackEvent } from '$lib/actions/analytics';
    import { PlatformType } from '@appwrite.io/console';

    const projectId = $page.params.project;

    async function beforeSubmit() {
        if ($createPlatform.$id) {
            await sdk.forConsole.projects.updatePlatform(
                projectId,
                $createPlatform.$id,
                $createPlatform.name,
                $createPlatform.key || undefined,
                $createPlatform.store || undefined,
                $createPlatform.hostname || undefined
            );

            return;
        }

        const platform = await sdk.forConsole.projects.createPlatform(
            projectId,
            PlatformType.Android,
            $createPlatform.name,
            $createPlatform.key || undefined,
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
    <svelte:fragment slot="title">Android registration</svelte:fragment>
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
