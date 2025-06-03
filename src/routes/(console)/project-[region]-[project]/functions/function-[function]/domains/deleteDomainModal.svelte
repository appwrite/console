<script lang="ts">
    import { Button, InputCheckbox } from '$lib/elements/forms';
    import { sdk } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import { invalidate } from '$app/navigation';
    import type { Models } from '@appwrite.io/console';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Dependencies } from '$lib/constants';
    import { Confirm } from '$lib/components';
    import { Typography } from '@appwrite.io/pink-svelte';
    import { page } from '$app/state';

    export let show = false;
    export let selectedProxyRule: Models.ProxyRule;

    let error = '';
    let confirm = false;

    async function deleteDomain() {
        try {
            await sdk
                .forProject(page.params.region, page.params.project)
                .proxy.deleteRule(selectedProxyRule.$id);
            await invalidate(Dependencies.FUNCTION_DOMAINS);
            show = false;
            addNotification({
                type: 'success',
                message: `Domain has been deleted`
            });
            trackEvent(Submit.DomainDelete);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.DomainDelete);
        }
    }
</script>

<Confirm title="Delete domain" bind:open={show} onSubmit={deleteDomain} bind:error>
    {#if selectedProxyRule}
        <Typography.Text variant="m-400">
            Are you sure you want to delete this domain? You will no longer be able to execute your
            function by visiting:
        </Typography.Text>
        <Typography.Text variant="m-500">
            {selectedProxyRule.domain}
        </Typography.Text>
    {/if}
    <InputCheckbox
        required
        bind:checked={confirm}
        id="confirm"
        label="I understand and confirm"
        size="s" />
    <svelte:fragment slot="footer">
        <Button text on:click={() => (show = false)}>Cancel</Button>
        <Button secondary submit disabled={!confirm}>Delete</Button>
    </svelte:fragment>
</Confirm>
