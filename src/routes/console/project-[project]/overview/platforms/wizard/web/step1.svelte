<script lang="ts">
    import { page } from '$app/stores';
    import { Alert } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { FormList, InputText } from '$lib/elements/forms';
    import { WizardStep } from '$lib/layout';
    import { sdk } from '$lib/stores/sdk';
    import { wizard } from '$lib/stores/wizard';
    import { createPlatform } from '../store';
    import { app } from '$lib/stores/app';
    import Light from './light.svg';
    import Dark from './dark.svg';
    import { Submit, trackEvent } from '$lib/actions/analytics';
    import LL from '$i18n/i18n-svelte';

    const projectId = $page.params.project;
    const suggestions = ['*.vercel.app', '*.netlify.app', '*.gitpod.io'];

    $wizard.media = $app.themeInUse === 'dark' ? Dark : Light;
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
            'web',
            $createPlatform.name,
            undefined,
            undefined,
            $createPlatform.hostname || undefined
        );

        trackEvent(Submit.PlatformCreate, {
            type: 'web'
        });

        $createPlatform.$id = platform.$id;
    }
</script>

<WizardStep {beforeSubmit}>
    <svelte:fragment slot="title"
        >{$LL.console.project.forms.overview.title.register.web()}</svelte:fragment>
    <FormList>
        <InputText
            id="name"
            label={$LL.console.project.forms.overview.inputs.webAppname.label()}
            placeholder={$LL.console.project.forms.overview.inputs.webAppname.placeholder()}
            required
            bind:value={$createPlatform.name} />
        <div>
            <InputText
                id="hostname"
                label={$LL.console.project.forms.overview.inputs.webHostName.label()}
                placeholder="localhost"
                tooltip={$LL.console.project.forms.overview.inputs.webHostName.placeholder()}
                required
                bind:value={$createPlatform.hostname} />
            <div class="u-flex u-gap-16 u-margin-block-start-8">
                {#each suggestions as suggestion}
                    <Pill
                        button
                        selected={$createPlatform.hostname === suggestion}
                        on:click={() => ($createPlatform.hostname = suggestion)}>
                        {suggestion}
                    </Pill>
                {/each}
            </div>
        </div>
        <Alert type="warning">
            {$LL.console.project.forms.overview.texts.wildcard()}
            <a
                href="https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS"
                target="_blank"
                rel="noopener noreferrer"
                class="link">
                Cross-Origin Resource Sharing (CORS)</a>
            {$LL.console.project.forms.overview.texts.moreInfo()}
        </Alert>
    </FormList>
</WizardStep>
