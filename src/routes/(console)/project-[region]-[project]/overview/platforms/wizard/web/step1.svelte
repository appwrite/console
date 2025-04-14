<script lang="ts">
    import { page } from '$app/stores';
    import { Alert } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { FormList, InputText } from '$lib/elements/forms';
    import { WizardStep } from '$lib/layout';
    import { sdk } from '$lib/stores/sdk';
    import { createPlatform } from '../store';
    import { Submit, trackEvent } from '$lib/actions/analytics';
    import { PlatformType } from '@appwrite.io/console';
    import { hostnameRegex } from '$lib/helpers/string';

    const projectId = $page.params.project;
    const suggestions = ['*.vercel.app', '*.netlify.app', '*.gitpod.io'];

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
            PlatformType.Web,
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
    <svelte:fragment slot="title">Hostname registration</svelte:fragment>
    <FormList>
        <InputText
            id="name"
            label="Name"
            placeholder="My Web App"
            required
            bind:value={$createPlatform.name} />
        <div>
            <InputText
                id="hostname"
                label="Hostname"
                placeholder="localhost"
                tooltip="The hostname that your website will use to interact with the Appwrite APIs in production or development environments. No protocol or port number required."
                required
                pattern={hostnameRegex}
                patternError="Please enter a valid hostname"
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
            Using wildcard hostnames in production can become insecure. You can read about
            <a
                href="https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS"
                target="_blank"
                rel="noopener noreferrer"
                class="link">
                Cross-Origin Resource Sharing (CORS)</a> for more information.
        </Alert>
    </FormList>
</WizardStep>
