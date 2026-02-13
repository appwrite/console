<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { sdk } from '$lib/stores/sdk';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { addNotification } from '$lib/stores/notifications';
    import { trackError } from '$lib/actions/analytics';
    import { generateFingerprintToken } from '$lib/helpers/fingerprint';
    import { Alert, Layout, Modal, Typography } from '@appwrite.io/pink-svelte';

    let {
        show = $bindable(false),
        projectId
    }: {
        show: boolean;
        projectId: string;
    } = $props();

    let loading = $state(false);
    let error: string | null = $state(null);

    async function handleResume() {
        loading = true;
        error = null;

        try {
            const fingerprint = await generateFingerprintToken();
            sdk.forConsole.client.headers['X-Appwrite-Console-Fingerprint'] = fingerprint;

            try {
                await sdk.forConsole.projects.createConsoleAccess({ projectId });
            } finally {
                delete sdk.forConsole.client.headers['X-Appwrite-Console-Fingerprint'];
            }

            addNotification({
                type: 'success',
                message: 'Project resumed successfully'
            });

            // Reload project data to get updated consoleAccessedAt
            await invalidate(Dependencies.PROJECT);

            show = false;
        } catch (e) {
            const message =
                e && typeof e === 'object' && 'message' in e
                    ? String((e as { message: string }).message)
                    : 'Failed to resume project. Please try again.';
            error = message;
            trackError(e, 'resume_paused_project');
        } finally {
            loading = false;
        }
    }
</script>

<Modal title="Project paused" bind:open={show} size="s" dismissible={false}>
    <Layout.Stack gap="m">
        <Typography.Text>
            This project has been paused due to inactivity.
        </Typography.Text>
        <Typography.Text>
            Your data is safe and will remain intact. Resume the project to continue using it.
        </Typography.Text>

        {#if error}
            <Alert.Inline status="error" dismissible on:dismiss={() => (error = null)}>
                {error}
            </Alert.Inline>
        {/if}
    </Layout.Stack>

    <svelte:fragment slot="footer">
        <Layout.Stack direction="row" justifyContent="flex-end">
            <Button disabled={loading} on:click={handleResume}>
                {#if loading}
                    Resuming...
                {:else}
                    Resume project
                {/if}
            </Button>
        </Layout.Stack>
    </svelte:fragment>
</Modal>
