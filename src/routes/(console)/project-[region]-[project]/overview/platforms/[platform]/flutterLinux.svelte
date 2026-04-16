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

    let packageName: string = null;

    onMount(() => {
        packageName ??= ($platform as Models.PlatformLinux).packageName;
    });

    async function updatePackageName() {
        try {
            await sdk.forProject($project.region, $project.$id).project.updateLinuxPlatform({
                platformId: $platform.$id,
                name: $platform.name,
                packageName
            });

            await invalidate(Dependencies.PLATFORM);
            trackEvent(Submit.PlatformUpdate, {
                type: 'linux'
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

<Form onSubmit={updatePackageName}>
    <CardGrid>
        <svelte:fragment slot="title">Package name</svelte:fragment>
        Your application name.
        <svelte:fragment slot="aside">
            <InputText
                id="package-name"
                label="Package Name"
                bind:value={packageName}
                required
                placeholder="appname" />
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button
                disabled={packageName === ($platform as Models.PlatformLinux).packageName}
                submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
