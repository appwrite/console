<script lang="ts">
    import { page } from '$app/stores';
    import { Alert } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { FormList, InputText } from '$lib/elements/forms';
    import { WizardStep } from '$lib/layout';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { createPlatform } from '../store';

    const projectId = $page.params.project;
    const suggestions = ['*.vercel.app', '*.netlify.app', '*.gitpod.app'];

    async function beforeSubmit() {
        if ($createPlatform.$id) {
            await sdkForConsole.projects.updatePlatform(
                projectId,
                $createPlatform.$id,
                $createPlatform.name,
                undefined,
                undefined,
                $createPlatform.hostname
            );

            return;
        }

        const platform = await sdkForConsole.projects.createPlatform(
            projectId,
            'web',
            $createPlatform.name,
            undefined,
            undefined,
            $createPlatform.hostname
        );

        $createPlatform.$id = platform.$id;
    }
</script>

<WizardStep {beforeSubmit}>
    <svelte:fragment slot="title">Register your Web app</svelte:fragment>
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
            Tip: Avoid using wildcard hostnames in production to keep your project secure. Check out
            our documentation for more info.
        </Alert>
    </FormList>
</WizardStep>
