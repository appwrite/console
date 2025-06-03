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

    let key: string = null;

    onMount(() => {
        key ??= $platform.key;
    });

    async function updateHostname() {
        try {
            await sdk.forConsole.projects.updatePlatform(
                $project.$id,
                $platform.$id,
                $platform.name,
                key,
                $platform.store || undefined,
                $platform.hostname || undefined
            );
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

<Form onSubmit={updateHostname}>
    <CardGrid>
        <svelte:fragment slot="title">Package name</svelte:fragment>
        Your package name is generally the applicationId in your app-level build.gradle file.
        <svelte:fragment slot="aside">
            <InputText
                id="key"
                label="Package name"
                bind:value={key}
                required
                placeholder="com.company.appname" />
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={key === $platform.hostname} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
