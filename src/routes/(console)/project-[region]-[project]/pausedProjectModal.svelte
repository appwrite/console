<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { sdk } from '$lib/stores/sdk';
    import { goto, invalidate } from '$app/navigation';
    import { resolve } from '$app/paths';
    import { Dependencies } from '$lib/constants';
    import { addNotification } from '$lib/stores/notifications';
    import { Submit, trackError } from '$lib/actions/analytics';
    import { generateFingerprintToken } from '$lib/helpers/fingerprint';
    import { Alert, Layout, Modal, Typography } from '@appwrite.io/pink-svelte';

    let {
        show = $bindable(false),
        projectId,
        teamId
    }: {
        show: boolean;
        projectId: string;
        teamId: string;
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
                await (
                    sdk.forConsole.projects as unknown as {
                        updateStatus(params: {
                            projectId: string;
                            status: string;
                        }): Promise<unknown>;
                    }
                ).updateStatus({ projectId, status: 'active' });
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
            trackError(e, Submit.ProjectResume);
        } finally {
            loading = false;
        }
    }
</script>

<Modal title="Project paused" bind:open={show} size="s" dismissible={false}>
    <Layout.Stack gap="m">
        <Typography.Text>This project has been paused due to inactivity.</Typography.Text>
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
            <Button
                text
                disabled={loading}
                on:click={() =>
                    goto(
                        resolve('/(console)/organization-[organization]', {
                            organization: teamId
                        })
                    )}>
                Cancel
            </Button>
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
