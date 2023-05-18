<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { CardGrid, Heading } from '$lib/components';
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
                type: 'flutter-macos'
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
        <Heading tag="h6" size="7">Bundle ID</Heading>
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
