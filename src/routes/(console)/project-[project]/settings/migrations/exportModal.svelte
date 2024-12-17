<script lang="ts">
    import { page } from '$app/stores';
    import { Alert, Box, Modal } from '$lib/components';
    import { Button, FormList, InputText, InputTextarea } from '$lib/elements/forms';
    import { getFormData } from '$lib/helpers/form';
    import { feedback } from '$lib/stores/feedback';
    import { sdk } from '$lib/stores/sdk';
    import { project } from '../../store';

    export let show = false;
    let submitted = false;

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
        submitted = true;

        const formData = getFormData<{ endpoint: string; feedback: string }>(e);

        // TODO: Send feedback somewhere
        const { endpoint, feedback: message } = formData;

        try {
            await feedback.submitFeedback(`feedback-${$feedback.type}`, message, $page.url.href);
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
        window.location.href = dest;
    };
</script>

<Modal title="Export to self-hosted instance" bind:show {onSubmit}>
    <FormList gap={24}>
        <Alert isStandalone>
            <svelte:fragment slot="title">API key creation</svelte:fragment>
            By initiating the transfer, an API key will be automatically generated in the background,
            which you can delete after completion
        </Alert>

        <InputText
            label="Endpoint self-hosted instance"
            required
            id="endpoint"
            placeholder="https://[YOUR_APPWRITE_HOSTNAME]"
            autofocus
            on:input={(e) => {
                if (!submitted) return;
                const input = e.target;
                const value = input.value;

                if (!isValidEndpoint(value)) {
                    input.setCustomValidity('Please enter a valid endpoint');
                } else {
                    input.setCustomValidity('');
                }
                input.reportValidity();
            }} />

        <Box>
            <p class="u-bold">
                Share your feedback: why our self-hosted solution works better for you
            </p>
            <p class="u-margin-block-start-8">
                We appreciate your continued support and we understand that our self-hosted solution
                might better fit your needs. To help us improve our Cloud solution, please share why
                it works better for you. Your feedback is important to us and we'll use it to make
                our services better.
            </p>
            <div class="u-margin-block-start-24">
                <InputTextarea id="feedback" label="Your feedback" placeholder="Type here..." />
            </div>
        </Box>
    </FormList>

    <div class="u-flex u-gap-16 u-cross-center" slot="footer">
        <span> You will be redirected to your self-hosted instance </span>

        <Button submit>Continue</Button>
    </div>
</Modal>
