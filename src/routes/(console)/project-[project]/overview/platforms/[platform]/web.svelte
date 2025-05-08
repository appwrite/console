<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputText } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { project } from '../../../store';
    import { platform } from './store';
    import { hostnameRegex } from '$lib/helpers/string';

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
                message: 'Platform hostname has been updated'
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
        <svelte:fragment slot="title">Hostname</svelte:fragment>
        You can use * to allow wildcard hostnames or subdomains.
        <svelte:fragment slot="aside">
            <InputText
                id="hostname"
                label="Hostname"
                bind:value={hostname}
                pattern={hostnameRegex}
                patternError="Please enter a valid hostname"
                required
                placeholder="myapp.com" />
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={hostname === $platform.hostname} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
