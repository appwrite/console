<script lang="ts">
    import { page } from '$app/state';
    import { sdk } from '$lib/stores/sdk';
    import { project } from '../../store';
    import { Box, Modal } from '$lib/components';
    import { getFormData } from '$lib/helpers/form';
    import { feedback } from '$lib/stores/feedback';
    import { Alert, Layout, Typography } from '@appwrite.io/pink-svelte';
    import { Button, InputText, InputTextarea } from '$lib/elements/forms';

    export let show = false;

    let endpointUrl = '';
    let redirecting = false;

    const isValidEndpoint = (endpoint: string) => {
        try {
            // Endpoint should be a valid URL. It may not have a path, nor a query string
            const url = new URL(endpoint);

            return (
                url.protocol &&
                url.hostname &&
                (url.pathname === '/' || !url.pathname) &&
                !url.search
            );
        } catch {
            return false;
        }
    };

    const getCurrentEndpoint = () => {
        // Remove subpaths and query strings from the current URL. Add a /v1 suffix
        const url = new URL(window.location.href);
        url.pathname = '';
        url.search = '';
        url.hash = '';
        url.pathname = '/v1';
        return url.toString();
    };

    const removeTrailingSlash = (endpoint: string) => {
        if (endpoint.endsWith('/')) {
            return endpoint.slice(0, -1);
        }
        return endpoint;
    };

    const onSubmit = async (e: SubmitEvent) => {
        e.preventDefault();
        redirecting = true;

        const formData = getFormData<{ endpoint: string; feedback: string }>(e);

        // TODO: Send feedback somewhere
        const { endpoint, feedback: message } = formData;

        try {
            await feedback.submitFeedback(`feedback-${$feedback.type}`, message, page.url.href);
        } catch (error) {
            console.error(
                'Feedback could not be submitted, but we continue to redirect to do export.'
            );
            console.error(error);
        }

        if (!isValidEndpoint(endpoint)) {
            const endpointInput = document.getElementById('endpoint') as HTMLInputElement;
            endpointInput.setCustomValidity('Please enter a valid endpoint');
            endpointInput.reportValidity();
            return;
        }

        const currEndpoint = getCurrentEndpoint();
        // Create API key
        const { secret } = await sdk.forConsole.projects.createKey(
            $project.$id,
            `[AUTO-GENERATED] Migration ${new Date().toISOString()}`,
            [
                'users.read',
                'teams.read',
                'databases.read',
                'collections.read',
                'attributes.read',
                'indexes.read',
                'documents.read',
                'files.read',
                'buckets.read',
                'functions.read',
                'execution.read',
                'locale.read',
                'avatars.read',
                'health.read'
            ],
            undefined
        );

        const migrationData = {
            endpoint: currEndpoint,
            projectId: $project.$id,
            apiKey: secret
        };

        const dest = `${removeTrailingSlash(endpoint)}/?migrate=${encodeURIComponent(
            JSON.stringify(migrationData)
        )}`;

        redirecting = false;
        window.location.href = dest;
    };
</script>

<Modal title="Export to self-hosted instance" bind:show {onSubmit}>
    <Layout.Stack gap="l">
        <Alert.Inline status="info">
            <svelte:fragment slot="title">API key creation</svelte:fragment>
            By initiating the transfer, an API key will be automatically generated in the background,
            which you can delete after completion
        </Alert.Inline>

        <InputText
            required
            id="endpoint"
            autofocus
            bind:value={endpointUrl}
            label="Endpoint self-hosted instance"
            placeholder="https://<YOUR_APPWRITE_HOSTNAME>" />

        <Box>
            <Layout.Stack gap="xl">
                <Typography.Text variant="m-600">
                    Share your feedback: why our self-hosted solution works better for you
                </Typography.Text>

                We appreciate your continued support and we understand that our self-hosted solution
                might better fit your needs. To help us improve our Cloud solution, please share why
                it works better for you. Your feedback is important to us and we'll use it to make
                our services better.

                <InputTextarea id="feedback" label="Your feedback" placeholder="Type here..." />
            </Layout.Stack>
        </Box>
    </Layout.Stack>

    <Layout.Stack
        direction="row"
        gap="l"
        alignItems="center"
        justifyContent="flex-end"
        slot="footer">
        You will be redirected to your self-hosted instance

        <Button
            submit
            forceShowLoader
            submissionLoader={redirecting}
            disabled={!isValidEndpoint(endpointUrl)}>
            Continue
        </Button>
    </Layout.Stack>
</Modal>
