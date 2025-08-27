<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/state';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Confirm } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { createEventDispatcher } from 'svelte';
    import { func } from '../store';
    import { isValueOfStringEnum } from '$lib/helpers/types';
    import { Runtime } from '@appwrite.io/console';

    export let show = false;
    const functionId = page.params.function;
    let error = '';

    const dispatch = createEventDispatcher();

    const handleSubmit = async () => {
        try {
            if (!isValueOfStringEnum(Runtime, $func.runtime)) {
                throw new Error(`Invalid runtime: ${$func.runtime}`);
            }
            await sdk.forProject(page.params.region, page.params.project).functions.update({
                functionId,
                name: $func.name,
                runtime: $func.runtime,
                execute: $func.execute || undefined,
                events: $func.events || undefined,
                schedule: $func.schedule || undefined,
                timeout: $func.timeout || undefined,
                enabled: $func.enabled || undefined,
                logging: $func.logging || undefined,
                entrypoint: $func.entrypoint,
                commands: $func.commands || undefined,
                scopes: $func.scopes || undefined,
                installationId: '',
                providerRepositoryId: '',
                providerBranch: '',
                providerSilentMode: true,
                providerRootDirectory: ''
            });
            await invalidate(Dependencies.FUNCTION);
            dispatch('success');
            addNotification({
                type: 'success',
                message: `Repository has been disconnected from your function`
            });
            trackEvent(Submit.FunctionDisconnectRepo);
            show = false;
        } catch (e) {
            error = e.message;
            trackError(e, Submit.FunctionDisconnectRepo);
        }
    };

    $: if (!show) {
        error = '';
    }
</script>

<Confirm title="Disconnect Git repository" bind:open={show} bind:error onSubmit={handleSubmit}>
    <p data-private>
        Are you sure you want to disconnect <b>{$func.name}</b>? This will affect future deployments
        to this function.
    </p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (show = false)}>Cancel</Button>
        <Button secondary submit>Disconnect</Button>
    </svelte:fragment>
</Confirm>
