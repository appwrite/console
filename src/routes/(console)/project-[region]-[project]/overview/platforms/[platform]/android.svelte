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

    let applicationId: string = null;

    onMount(() => {
        applicationId ??= ($platform as Models.PlatformAndroid).applicationId;
    });

    async function updateApplicationId() {
        try {
            await sdk.forProject($project.region, $project.$id).project.updateAndroidPlatform({
                platformId: $platform.$id,
                name: $platform.name,
                applicationId
            });
            await invalidate(Dependencies.PLATFORM);
            trackEvent(Submit.PlatformUpdate, {
                type: 'android'
            });
            addNotification({
                type: 'success',
                message: 'Platform Package Name has been updated'
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

<Form onSubmit={updateApplicationId}>
    <CardGrid>
        <svelte:fragment slot="title">Package name</svelte:fragment>
        Your package name is generally the applicationId in your app-level build.gradle file.
        <svelte:fragment slot="aside">
            <InputText
                id="applicationId"
                label="Package name"
                bind:value={applicationId}
                required
                placeholder="com.company.appname" />
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button
                disabled={applicationId === ($platform as Models.PlatformAndroid).applicationId}
                submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
