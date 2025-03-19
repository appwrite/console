<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, FormList, InputText } from '$lib/elements/forms';
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
                type: 'apple-ios'
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

<Form onSubmit={updateHostname}>
    <CardGrid>
        <svelte:fragment slot="title">Bundle ID</svelte:fragment>
        You can find your Bundle Identifier in the General tab for your app's primary target in Xcode.
        <svelte:fragment slot="aside">
            <InputText
                id="bundle-id"
                label="Bundle ID"
                bind:value={key}
                required
                placeholder="com.company.appname" />
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={key === $platform.key} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
