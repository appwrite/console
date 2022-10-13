<script lang="ts">
    import { page } from '$app/stores';
    import { FormList, InputText } from '$lib/elements/forms';
    import { WizardStep } from '$lib/layout';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { createPlatform } from '../store';

    const projectId = $page.params.project;

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
            required
            bind:value={$createPlatform.hostname} />
    </FormList>
</WizardStep>
