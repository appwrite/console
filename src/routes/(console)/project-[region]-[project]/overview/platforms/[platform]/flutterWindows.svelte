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

    let packageIdentifierName: string = null;

    onMount(() => {
        packageIdentifierName ??= ($platform as Models.PlatformWindows).packageIdentifierName;
    });

    async function updatePackageIdentifierName() {
        try {
            await sdk.forProject($project.region, $project.$id).project.updateWindowsPlatform({
                platformId: $platform.$id,
                name: $platform.name,
                packageIdentifierName
            });

            await invalidate(Dependencies.PLATFORM);
            trackEvent(Submit.PlatformUpdate, {
                type: 'windows'
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

<Form onSubmit={updatePackageIdentifierName}>
    <CardGrid>
        <svelte:fragment slot="title">Package name</svelte:fragment>
        Your application name.
        <svelte:fragment slot="aside">
            <InputText
                id="package-name"
                label="Package Name"
                bind:value={packageIdentifierName}
                required
                placeholder="appname" />
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button
                disabled={packageIdentifierName ===
                    ($platform as Models.PlatformWindows).packageIdentifierName}
                submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
