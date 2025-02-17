<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { invalidate } from '$app/navigation';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Dependencies } from '$lib/constants';
    import { Confirm } from '$lib/components';
    import { Typography } from '@appwrite.io/pink-svelte';

    export let show = false;
    export let selectedCertificate;

    let error = '';

    async function deleteCertificate() {
        try {
            await invalidate(Dependencies.DOMAIN);
            //TODO: add method
            show = false;
            addNotification({
                type: 'success',
                message: `Certificate has been deleted`
            });
            trackEvent(Submit.DomainDelete);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.DomainDelete);
        }
    }
</script>

<Confirm title="Delete certificate" bind:open={show} onSubmit={deleteCertificate} bind:error>
    <Typography.Text>
        Are you sure you want to delete SSL certificate? This action is irreversible.
    </Typography.Text>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (show = false)}>Cancel</Button>
        <Button secondary submit danger>Delete</Button>
    </svelte:fragment>
</Confirm>
