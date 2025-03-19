<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import Confirm from '$lib/components/confirm.svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { type Models } from '@appwrite.io/console';
    import { FormList, InputCheckbox } from '$lib/elements/forms';

    export let showDelete = false;
    export let projectFunction: Models.Function;

    let error: string;
    let confirmedDeletion = false;

    const handleSubmit = async () => {
        try {
            await sdk.forProject.functions.delete(projectFunction.$id);
            showDelete = false;
            addNotification({
                type: 'success',
                message: `Function has been deleted`
            });
            await goto(`${base}/project-${$page.params.project}/functions`);
            trackEvent(Submit.FunctionDelete);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.FunctionDelete);
        }
    };
</script>

<Confirm
    onSubmit={handleSubmit}
    disabled={!confirmedDeletion}
    title="Delete function"
    bind:open={showDelete}
    bind:error>
    <p data-private>Are you sure you want to delete <strong>{projectFunction.name}</strong>?</p>

    <p data-private>
        The function and all associated deployments will be permanently deleted. This action is
        irreversible.
    </p>

    <InputCheckbox
        size="s"
        required
        id="delete_function"
        bind:checked={confirmedDeletion}
        label="I understand and confirm" />
</Confirm>
