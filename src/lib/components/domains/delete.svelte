<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { trackEvent } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForProject } from '$lib/stores/sdk';
    import type { Models } from '@aw-labs/appwrite-console';

    export let showDelete = false;
    export let selectedRule: Models.ProxyRule = null;
    export let project: Models.Project = null;

    const handleSubmit = async () => {
        try {
            await sdkForProject.proxy.deleteRule(selectedRule.$id);
            await invalidate(Dependencies.RULES);
            showDelete = false;
            addNotification({
                type: 'success',
                message: `Domain has been deleted`
            });
            trackEvent('submit_rule_delete');
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    };
</script>

<Modal bind:show={showDelete} on:submit={handleSubmit} warning>
    <svelte:fragment slot="header">Delete Domain</svelte:fragment>
    {#if selectedRule}
        <p data-private>
            Are you sure you want to delete <b>{selectedRule.domain}</b> from '{project.name}'?
        </p>
    {/if}
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}>Cancel</Button>
        <Button secondary submit>Delete</Button>
    </svelte:fragment>
</Modal>
