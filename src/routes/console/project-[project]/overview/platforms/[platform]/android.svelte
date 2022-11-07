<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { CardGrid, Heading } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, FormList, InputText } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { project } from '../../../store';
    import { platform } from './store';

    let hostname: string = null;

    onMount(() => {
        hostname ??= $platform.hostname;
    });

    const updateHostname = async () => {
        try {
            await sdkForConsole.projects.updatePlatform(
                $project.$id,
                $platform.$id,
                $platform.name,
                undefined,
                undefined,
                hostname
            );
            invalidate(Dependencies.PLATFORM);
            addNotification({
                type: 'success',
                message: 'Platform Package Name has been updated'
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
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
                    id="hostname"
                    label="Package Name"
                    bind:value={hostname}
                    required
                    placeholder="com.company.appname" />
            </FormList>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={hostname === $platform.hostname} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
