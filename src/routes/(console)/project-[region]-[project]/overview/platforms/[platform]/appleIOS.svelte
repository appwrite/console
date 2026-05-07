<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputText } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { project } from '../../../store';
    import { platform } from './store';

    import type { Models } from '@appwrite.io/console';

    let bundleIdentifier: string = null;

    onMount(() => {
        bundleIdentifier ??= ($platform as Models.PlatformApple).bundleIdentifier;
    });

    async function updateBundleIdentifier() {
        try {
            await sdk.forProject($project.region, $project.$id).project.updateApplePlatform({
                platformId: $platform.$id,
                name: $platform.name,
                bundleIdentifier
            });
            await invalidate(Dependencies.PLATFORM);
            trackEvent(Submit.PlatformUpdate, {
                type: 'apple'
            });
            addNotification({
                type: 'success',
                message: 'Platform Bundle ID has been updated'
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.PlatformUpdate);
        }
    }
</script>

<Form onSubmit={updateBundleIdentifier}>
    <CardGrid>
        <svelte:fragment slot="title">Bundle ID</svelte:fragment>
        You can find your Bundle Identifier in the General tab for your app's primary target in Xcode.
        <svelte:fragment slot="aside">
            <InputText
                id="bundle-id"
                label="Bundle ID"
                bind:value={bundleIdentifier}
                required
                placeholder="com.company.appname" />
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button
                disabled={bundleIdentifier === ($platform as Models.PlatformApple).bundleIdentifier}
                submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
