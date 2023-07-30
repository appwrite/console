<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/stores';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { func } from '../store';

    export let show = false;
    const functionId = $page.params.function;

    const handleSubmit = async () => {
        try {
            await sdk.forProject.functions.update(
                functionId,
                $func.name,
                $func.execute || undefined,
                $func.entrypoint,
                $func.events || undefined,
                $func.schedule || undefined,
                $func.timeout || undefined,
                $func.enabled,
                $func.logging,
                $func.commands,
                $func.installationId,
                '',
                '',
                true,
                ''
            );
            await invalidate(Dependencies.FUNCTION);
            addNotification({
                type: 'success',
                message: `Repository has been disconnected from your function`
            });
            trackEvent(Submit.FunctionDisconnectRepo);
            show = false;
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.FunctionDisconnectRepo);
        }
    };
</script>

<Modal bind:show onSubmit={handleSubmit} icon="exclamation" state="warning" headerDivider={false}>
    <svelte:fragment slot="header">Disconnect Git repository</svelte:fragment>
    <p data-private>
        Are you sure you want to disconnect {$func.name}? This will affect future deployments to
        this function.
    </p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (show = false)}>Cancel</Button>
        <Button secondary submit>Disconnect</Button>
    </svelte:fragment>
</Modal>
