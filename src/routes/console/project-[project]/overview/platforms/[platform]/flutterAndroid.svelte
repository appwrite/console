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
    import LL from '$i18n/i18n-svelte';


    let key: string = null;

    onMount(() => {
        key ??= $platform.key;
    });

    const updateHostname = async () => {
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
                type: 'flutter-android'
            });
            addNotification({
                type: 'success',
                message: $LL.components.notification.platformPackageNameUpdated()
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

<Form onSubmit={updateHostname}>
    <CardGrid>
        <Heading tag="h6" size="7">{$LL.console.project.title.packageName()}</Heading>
        <p class="text">
            {$LL.console.project.texts.overview.packageName()}
        </p>
        <svelte:fragment slot="aside">
            <FormList>
                <InputText
                    id="package-name"
                    label={$LL.console.project.forms.overview.inputs.androidPlatformKey.label()}
                    bind:value={key}
                    required
                    placeholder="com.company.appname" />
            </FormList>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={key === $platform.key} submit>{$LL.console.project.button.submit.update()}</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
