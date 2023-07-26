<script lang="ts">
    import { Wizard } from '$lib/layout';
    import SelectRepository from './steps/selectRepository.svelte';
    import GitConfiguration from './steps/gitConfiguration.svelte';
    import type { WizardStepsType } from '$lib/layout/wizard.svelte';
    import { sdk } from '$lib/stores/sdk';
    import { func } from '$routes/console/project-[project]/functions/function-[function]/store';
    import { choices, installation, repository } from './store';
    import { wizard } from '$lib/stores/wizard';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';

    async function createGitHubInstallation() {
        await sdk.forProject.functions.update(
            $func.$id,
            $func.name,
            $func.execute || undefined,
            $func.entrypoint || undefined,
            $func.events || undefined,
            $func.schedule || undefined,
            $func.timeout || undefined,
            $func.enabled,
            $func.logging,
            $func.commands || undefined,
            $installation.$id,
            $repository.id,
            $choices.branch,
            $choices.silentMode,
            $choices.rootDir
        );
        await invalidate(Dependencies.FUNCTION);
        resetState();
        wizard.hide();
    }

    function resetState() {
        choices.set({
            branch: null,
            silentMode: false,
            rootDir: null
        });
        installation.set(null);
        repository.set(null);
    }

    const stepsComponents: WizardStepsType = new Map();
    stepsComponents.set(1, {
        label: 'Select repository',
        component: SelectRepository
    });
    stepsComponents.set(2, {
        label: 'Git configuration',
        component: GitConfiguration
    });
</script>

<Wizard
    title="Connect Git"
    steps={stepsComponents}
    on:finish={createGitHubInstallation}
    on:exit={resetState} />
