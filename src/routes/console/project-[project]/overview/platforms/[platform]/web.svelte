<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { CardGrid, Heading } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, FormList, InputText } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { project } from '../../../store';
    import { platform } from './store';
    import LL from '$i18n/i18n-svelte';

    let hostname: string = null;

    onMount(() => {
        hostname ??= $platform.hostname;
    });

    async function updateHostname() {
        try {
            await sdk.forConsole.projects.updatePlatform(
                $project.$id,
                $platform.$id,
                $platform.name,
                $platform.key || undefined,
                $platform.store || undefined,
                hostname
            );
            await invalidate(Dependencies.PLATFORM);
            addNotification({
                type: 'success',
                message: $LL.components.notification.platformHostnameUpdated()
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    }
</script>

<Form onSubmit={updateHostname}>
    <CardGrid>
        <Heading tag="h6" size="7">{$LL.console.project.title.hostName()}</Heading>
        <p class="text">{$LL.console.project.texts.overview.hostName()}</p>
        <svelte:fragment slot="aside">
            <FormList>
                <InputText
                    id="hostname"
                    label={$LL.console.project.forms.overview.inputs.webHostName.label()}
                    bind:value={hostname}
                    required
                    placeholder="myapp.com" />
            </FormList>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={hostname === $platform.hostname} submit
                >{$LL.console.project.button.submit.update()}</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
