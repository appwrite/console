<script lang="ts">
    import { WizardWithSteps } from '$lib/layout';
    import type { WizardStepsType } from '$lib/layout/wizardWithSteps.svelte';
    import { sdk } from '$lib/stores/sdk';
    import { func } from '$routes/(console)/project-[project]/functions/function-[function]/store';
    import { wizard } from '$lib/stores/wizard';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { addNotification } from '$lib/stores/notifications';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { isValueOfStringEnum } from '$lib/helpers/types';
    import { Runtime } from '@appwrite.io/console';
    import { choices } from '../store';
    import SelectRepository from './steps/selectRepository.svelte';
    import GitConfiguration from './steps/gitConfiguration.svelte';
    import { installation, repository } from '$lib/stores/vcs';

    async function createGitHubInstallation() {
        try {
            if (!isValueOfStringEnum(Runtime, $func.runtime)) {
                throw new Error(`Invalid runtime: ${$func.runtime}`);
            }
            await sdk.forProject.functions.update(
                $func.$id,
                $func.name,
                $func.runtime,
                $func.execute || undefined,
                $func.events || undefined,
                $func.schedule || undefined,
                $func.timeout || undefined,
                $func.enabled || undefined,
                $func.logging || undefined,
                $func.entrypoint || undefined,
                $func.commands || undefined,
                $func.scopes || undefined,
                $installation.$id,
                $repository.id,
                $choices.branch,
                $choices.silentMode || undefined,
                $choices.rootDir
            );
            trackEvent(Submit.FunctionConnectRepo, {
                customId: !!$func.$id
            });
            await invalidate(Dependencies.FUNCTION);
            resetState();
            wizard.hide();
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.FunctionConnectRepo);
        }
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
        label: 'Repository',
        component: SelectRepository
    });
    stepsComponents.set(2, {
        label: 'Git',
        component: GitConfiguration
    });
</script>

<WizardWithSteps
    title="Connect Git"
    steps={stepsComponents}
    on:finish={createGitHubInstallation}
    on:exit={resetState} />
