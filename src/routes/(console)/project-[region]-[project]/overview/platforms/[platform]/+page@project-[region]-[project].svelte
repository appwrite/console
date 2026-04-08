<script lang="ts">
    import type { Models } from '@appwrite.io/console';
    import Delete from './delete.svelte';
    import Web from './web.svelte';
    import AppleiOs from './appleIOS.svelte';
    import Android from './android.svelte';
    import FlutterLinux from './flutterLinux.svelte';
    import FlutterWindows from './flutterWindows.svelte';
    import { Box, CardGrid } from '$lib/components';
    import { Button, Form, InputText } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { onMount, type Component } from 'svelte';
    import { project } from '../../../store';
    import { platform } from './store';
    import { Dependencies } from '$lib/constants';
    import { invalidate } from '$app/navigation';
    import { getPlatformIdentifier } from '$lib/helpers/platform';

    const types: Record<string, Component> = {
        web: Web,
        android: Android,
        apple: AppleiOs,
        windows: FlutterWindows,
        linux: FlutterLinux
    };

    let showDelete = false;
    let name: string = null;

    onMount(() => {
        name ??= $platform.name;
    });

    async function updateName() {
        try {
            const projectSdk = sdk.forProject($project.region, $project.$id).project;
            const platformId = $platform.$id;
            switch ($platform.type) {
                case 'web':
                    await projectSdk.updateWebPlatform({
                        platformId,
                        name,
                        hostname: ($platform as Models.PlatformWeb).hostname || undefined
                    });
                    break;
                case 'android':
                    await projectSdk.updateAndroidPlatform({
                        platformId,
                        name,
                        applicationId: ($platform as Models.PlatformAndroid).applicationId
                    });
                    break;
                case 'apple':
                    await projectSdk.updateApplePlatform({
                        platformId,
                        name,
                        bundleIdentifier: ($platform as Models.PlatformApple).bundleIdentifier
                    });
                    break;
                case 'windows':
                    await projectSdk.updateWindowsPlatform({
                        platformId,
                        name,
                        packageIdentifierName: ($platform as Models.PlatformWindows)
                            .packageIdentifierName
                    });
                    break;
                case 'linux':
                    await projectSdk.updateLinuxPlatform({
                        platformId,
                        name,
                        packageName: ($platform as Models.PlatformLinux).packageName
                    });
                    break;
            }
            await invalidate(Dependencies.PLATFORM);
            addNotification({
                type: 'success',
                message: 'Platform name has been updated'
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    }
</script>

<Container>
    <Form onSubmit={updateName}>
        <CardGrid>
            <svelte:fragment slot="title">Name</svelte:fragment>
            Choose any name that will help you distinguish between platforms.
            <svelte:fragment slot="aside">
                <InputText
                    id="name"
                    label="Name"
                    bind:value={name}
                    required
                    placeholder="Enter name" />
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button disabled={name === $platform.name} submit>Update</Button>
            </svelte:fragment>
        </CardGrid>
    </Form>

    <svelte:component this={types[$platform.type]} />

    <CardGrid>
        <svelte:fragment slot="title">Delete platform</svelte:fragment>
        The Platform will be permanently deleted. This action is irreversible.
        <svelte:fragment slot="aside">
            <Box>
                <div class="u-flex u-gap-16">
                    <div class="u-cross-child-center u-line-height-1-5">
                        <h6 class="u-bold">{$platform.name}</h6>
                        <p>{getPlatformIdentifier($platform)}</p>
                    </div>
                </div>
            </Box>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button secondary on:click={() => (showDelete = true)}>Delete</Button>
        </svelte:fragment>
    </CardGrid>
</Container>

<Delete bind:showDelete />
