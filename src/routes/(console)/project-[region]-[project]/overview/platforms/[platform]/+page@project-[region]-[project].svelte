<script lang="ts">
    import Delete from './delete.svelte';
    import Web from './web.svelte';
    import FlutterIos from './flutterIOS.svelte';
    import FlutterAndroid from './flutterAndroid.svelte';
    import FlutterLinux from './flutterLinux.svelte';
    import FlutterMacOs from './flutterMacOS.svelte';
    import FlutterWindows from './flutterWindows.svelte';
    import AppleiOs from './appleIOS.svelte';
    import AppleMacOs from './appleMacOS.svelte';
    import AppleWatchOs from './appleWatchOS.svelte';
    import AppleTvos from './appleTvOS.svelte';
    import Android from './android.svelte';
    import { Box, CardGrid, Heading } from '$lib/components';
    import { Button, Form, FormList, InputText } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { onMount, SvelteComponent } from 'svelte';
    import { project } from '../../../store';
    import { platform } from './store';
    import { Dependencies } from '$lib/constants';
    import { invalidate } from '$app/navigation';

    const types: Record<string, typeof SvelteComponent<unknown>> = {
        web: Web,
        android: Android,
        'apple-ios': AppleiOs,
        'apple-macos': AppleMacOs,
        'apple-watchos': AppleWatchOs,
        'apple-tvos': AppleTvos,
        'flutter-ios': FlutterIos,
        'flutter-android': FlutterAndroid,
        'flutter-linux': FlutterLinux,
        'flutter-macos': FlutterMacOs,
        'flutter-windows': FlutterWindows,
        'flutter-web': Web
    };

    let showDelete = false;
    let name: string = null;

    onMount(() => {
        name ??= $platform.name;
    });

    async function updateName() {
        try {
            await sdk.forConsole.projects.updatePlatform(
                $project.$id,
                $platform.$id,
                name,
                $platform.key || undefined,
                $platform.store || undefined,
                $platform.hostname || undefined
            );
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
            <Heading tag="h6" size="7">Name</Heading>
            <p class="text">Choose any name that will help you distinguish between platforms.</p>
            <svelte:fragment slot="aside">
                <FormList>
                    <InputText
                        id="name"
                        label="Name"
                        bind:value={name}
                        required
                        placeholder="Enter name" />
                </FormList>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button disabled={name === $platform.name} submit>Update</Button>
            </svelte:fragment>
        </CardGrid>
    </Form>

    <svelte:component this={types[$platform.type]} />

    <CardGrid danger>
        <div>
            <Heading tag="h6" size="7">Delete platform</Heading>
        </div>
        <p>The Platform will be permanently deleted. This action is irreversible.</p>
        <svelte:fragment slot="aside">
            <Box>
                <div class="u-flex u-gap-16">
                    <div class="u-cross-child-center u-line-height-1-5">
                        <h6 class="u-bold">{$platform.name}</h6>
                        <p>{$platform.hostname}</p>
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
