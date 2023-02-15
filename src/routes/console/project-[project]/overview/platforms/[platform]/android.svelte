<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { CardGrid, Heading } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, FormList, InputText } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { project } from '../../../store';
    import { platform } from './store';

    let key: string = null;

    onMount(() => {
        key ??= $platform.key;
    });

    const updateHostname = async () => {
        try {
            await sdkForConsole.projects.updatePlatform(
                $project.$id,
                $platform.$id,
                $platform.name,
                key,
                $platform.store,
                $platform.hostname
            );
            invalidate(Dependencies.PLATFORM);
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
    };
</script>

<Form on:submit={updateHostname}>
    <CardGrid>
        <Heading tag="h6" size="7">Update Package Name</Heading>
        <p class="text">
            Your package name is generally the applicationId in your app-level build.gradle file.
        </p>
        <svelte:fragment slot="aside">
            <FormList>
                <InputText
                    id="key"
                    label="Package Name"
                    bind:value={key}
                    required
                    placeholder="com.company.appname" />
            </FormList>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={key === $platform.hostname} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
