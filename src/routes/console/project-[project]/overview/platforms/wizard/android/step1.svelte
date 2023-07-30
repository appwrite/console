<script lang="ts">
    import { page } from '$app/stores';
    import { FormList, InputText } from '$lib/elements/forms';
    import { WizardStep } from '$lib/layout';
    import { sdk } from '$lib/stores/sdk';
    import { createPlatform } from '../store';
    import { wizard } from '$lib/stores/wizard';
    import { app } from '$lib/stores/app';
    import Light from './light.svg';
    import Dark from './dark.svg';
    import { Submit, trackEvent } from '$lib/actions/analytics';
    import LL from '$i18n/i18n-svelte';

    $wizard.media = $app.themeInUse === 'dark' ? Dark : Light;

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
            'android',
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
    <svelte:fragment slot="title"
        >{$LL.console.project.forms.overview.title.register.android()}</svelte:fragment>
    <FormList>
        <InputText
            id="name"
            label={$LL.console.project.forms.overview.inputs.androidPlatformName.label()}
            placeholder={$LL.console.project.forms.overview.inputs.androidPlatformName.placeholder()}
            required
            bind:value={$createPlatform.name} />
        <InputText
            id="key"
            label={$LL.console.project.forms.overview.inputs.androidPlatformKey.label()}
            placeholder="com.company.appname"
            tooltip={$LL.console.project.forms.overview.inputs.androidPlatformKey.tooltip()}
            required
            bind:value={$createPlatform.key} />
    </FormList>
</WizardStep>
