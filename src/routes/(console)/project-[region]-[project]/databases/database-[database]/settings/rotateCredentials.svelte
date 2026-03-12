<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/state';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid, Modal } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import type { DedicatedDatabase } from '$lib/sdk/dedicatedDatabases';
    import { Alert } from '@appwrite.io/pink-svelte';

    let {
        database
    }: {
        database: DedicatedDatabase;
    } = $props();

    let showConfirm = $state(false);
    let isRotating = $state(false);

    async function rotateCredentials() {
        isRotating = true;
        try {
            await sdk
                .forProject(page.params.region, page.params.project)
                .dedicatedDatabases.rotateCredentials(database.$id);

            await invalidate(Dependencies.DATABASE);

            showConfirm = false;

            addNotification({
                message:
                    'Credentials have been rotated. Update your application with the new credentials.',
                type: 'success'
            });

            trackEvent(Submit.DatabaseRotateCredentials);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.DatabaseRotateCredentials);
        } finally {
            isRotating = false;
        }
    }
</script>

<CardGrid>
    <svelte:fragment slot="title">Credential rotation</svelte:fragment>
    Generate new database credentials. Existing connections using the old credentials will be
    terminated.
    <svelte:fragment slot="aside">
        <Alert.Inline status="warning" title="Warning">
            Rotating credentials will invalidate the current username and password. All active
            connections will be dropped. Make sure to update your application configuration
            immediately after rotation.
        </Alert.Inline>
    </svelte:fragment>

    <svelte:fragment slot="actions">
        <Button
            secondary
            on:click={() => {
                showConfirm = true;
                trackEvent('click_database_rotate_credentials');
            }}>
            Rotate credentials
        </Button>
    </svelte:fragment>
</CardGrid>

<Modal
    title="Rotate credentials"
    bind:show={showConfirm}
    onSubmit={rotateCredentials}>
    <p class="text">
        Are you sure you want to rotate the credentials for <b>{database.name}</b>? This will
        generate a new username and password, and all existing connections will be terminated.
    </p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showConfirm = false)}>Cancel</Button>
        <Button danger submit disabled={isRotating}>
            {isRotating ? 'Rotating...' : 'Rotate'}
        </Button>
    </svelte:fragment>
</Modal>
