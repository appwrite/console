<script lang="ts">
    import { CardGrid } from '$lib/components';
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
                key
            );
            project.load($project.$id);
            addNotification({
                type: 'success',
                message: 'Platform Bundle ID has been updated'
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
        <h6 class="heading-level-7">Update Bundle ID</h6>
        <p class="text">
            You can find your Bundle Identifier in the General tab for your app's primary target in
            Xcode.
        </p>
        <svelte:fragment slot="aside">
            <FormList>
                <InputText
                    id="bundle-id"
                    label="Bundle ID"
                    bind:value={key}
                    required
                    placeholder="com.company.appname" />
            </FormList>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={key === $platform.key} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
