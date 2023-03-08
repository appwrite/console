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
    import { CardGrid, Heading } from '$lib/components';
    import { Button, Form, FormList, InputText } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk, sdkForConsole } from '$lib/stores/sdk';
    import { onMount, SvelteComponent } from 'svelte';
    import { project } from '../../../store';
    import { platform } from './store';
    import { Dependencies } from '$lib/constants';
    import { invalidate } from '$app/navigation';

    const types: Record<string, typeof SvelteComponent> = {
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
        'flutter-windows': FlutterWindows
    };

    let showDelete = false;
    let name: string = null;
    let updating = false;

    onMount(() => {
        name ??= $platform.name;
    });

    async function updateName() {
        updating = true;
        try {
            await sdkForConsole.projects.updatePlatform(
                $project.$id,
                $platform.$id,
                name,
                $platform.key,
                $platform.store,
                $platform.hostname
            );
            invalidate(Dependencies.PLATFORM);
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

    $: {
        // When platform name is updated, finalize the updating flow
        $platform.name;
        updating = false;
    }
</script>

<Container>
    <Form on:submit={updateName}>
        <CardGrid>
            <Heading tag="h6" size="7">Update Name</Heading>
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
                <Button disabled={name === $platform.name || updating} submit>Update</Button>
            </svelte:fragment>
        </CardGrid>
    </Form>

    <svelte:component this={types[$platform.type]} />

    <CardGrid danger>
        <div>
            <Heading tag="h6" size="7">Delete Platform</Heading>
        </div>
        <p>The Platform will be permanently deleted. This action is irreversible.</p>
        <svelte:fragment slot="aside">
            <div class="box">
                <div class="u-flex u-gap-16">
                    <div class="u-cross-child-center u-line-height-1-5">
                        <h6 class="u-bold">{$platform.name}</h6>
                        <p>{$platform.hostname}</p>
                    </div>
                </div>
            </div>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button secondary on:click={() => (showDelete = true)}>Delete</Button>
        </svelte:fragment>
    </CardGrid>
</Container>

<Delete bind:showDelete />
