<script lang="ts" context="module">
    import { wizard } from '$lib/stores/wizard';
    import CreateAndroid from './createAndroid.svelte';
    import CreateApple from './createApple.svelte';
    import CreateFlutter from './createFlutter.svelte';
    import CreateReactNative from './createReactNative.svelte';
    import CreateWeb from './createWeb.svelte';
    import { createPlatform, versions } from './wizard/store';
    import { Click, trackEvent } from '$lib/actions/analytics';

    export enum Platform {
        Web,
        Flutter,
        Android,
        Apple,
        ReactNative
    }

    export async function addPlatform(type: Platform) {
        await versions.load();
        createPlatform.reset();
        trackEvent(Click.PlatformCreateClick, {
            platform: platforms[type],
            source: 'platforms_page'
        });
        wizard.start(platforms[type]);
    }

    export async function continuePlatform(
        platform: Platform,
        name: string,
        key: string,
        type: string
    ) {
        await versions.load();
        createPlatform.set({
            name: name,
            key: key,
            type: type
        });
        trackEvent(Click.PlatformCreateClick, {
            platform: platforms[platform],
            state: 'continue'
        });
        wizard.start(platforms[platform], null, 1, {
            isPlatformCreated: true,
            platform: type,
            key: key
        });
    }

    const platforms = {
        [Platform.Web]: CreateWeb,
        [Platform.Flutter]: CreateFlutter,
        [Platform.Android]: CreateAndroid,
        [Platform.Apple]: CreateApple,
        [Platform.ReactNative]: CreateReactNative
    };
</script>

<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Button } from '$lib/elements/forms';
    import type { PageData } from './$types';
    import { canWritePlatforms } from '$lib/stores/roles';
    import { setOverviewAction } from '../context';
    import {
        ActionMenu,
        Card,
        Empty,
        Icon,
        Layout,
        Popover,
        Table
    } from '@appwrite.io/pink-svelte';
    import Action from './action.svelte';
    import {
        IconAndroid,
        IconApple,
        IconCode,
        IconFlutter,
        IconReact
    } from '@appwrite.io/pink-icons-svelte';
    import type { ComponentType } from 'svelte';
    import DualTimeView from '$lib/components/dualTimeView.svelte';

    export let data: PageData;

    enum PlatformTypes {
        'apple-ios' = 'iOS',
        'apple-macos' = 'macOS',
        'apple-watchos' = 'watchOS',
        'apple-tvos' = 'tvOS',
        'android' = 'Android',
        'flutter-android' = 'Android',
        'flutter-ios' = 'iOS',
        'flutter-linux' = 'Linux',
        'flutter-macos' = 'macOS',
        'flutter-windows' = 'Windows',
        'flutter-web' = 'Web',
        'react-native-android' = 'Android',
        'react-native-ios' = 'iOS',
        'web' = 'Web'
    }
    const path = `${base}/project-${$page.params.project}/overview/platforms`;

    function getPlatformInfo(platform: string): ComponentType {
        if (platform.includes('flutter')) {
            return IconFlutter;
        } else if (platform.includes('react-native')) {
            return IconReact;
        } else if (platform.includes('apple')) {
            return IconApple;
        } else if (platform.includes('android')) {
            return IconAndroid;
        } else {
            return IconCode;
        }
    }

    setOverviewAction(Action);
</script>

{#if data.platforms.platforms.length}
    <Table.Root>
        <svelte:fragment slot="header">
            <Table.Header.Cell>Name</Table.Header.Cell>
            <Table.Header.Cell>Platform type</Table.Header.Cell>
            <Table.Header.Cell>Last updated</Table.Header.Cell>
        </svelte:fragment>
        {#each data.platforms.platforms as platform}
            <Table.Link href={`${path}/${platform.$id}`}>
                <Table.Cell>
                    {platform.name}
                </Table.Cell>
                <Table.Cell>
                    <Layout.Stack direction="row" gap="s" alignItems="center">
                        <Icon icon={getPlatformInfo(platform.type)} />
                        {PlatformTypes[platform.type]}
                    </Layout.Stack>
                </Table.Cell>
                <Table.Cell>
                    {#if platform.$updatedAt}
                        <DualTimeView time={platform.$updatedAt} />
                    {:else}
                        never
                    {/if}
                </Table.Cell>
            </Table.Link>
        {/each}
    </Table.Root>
{:else}
    <Card.Base padding="none">
        <Empty
            title="Add a platform to get started."
            description="Need a hand? Learn more in our documentation.">
            <svelte:fragment slot="actions">
                <Button external href="https://appwrite.io/docs/sdks" text>Documentation</Button>
                <Popover let:toggle padding="none" placement="bottom-end">
                    {#if $canWritePlatforms}
                        <Button secondary on:click={toggle}>
                            <span class="text">Add platform</span>
                        </Button>
                    {/if}
                    <svelte:fragment slot="tooltip">
                        <ActionMenu.Root>
                            <ActionMenu.Item.Button
                                on:click={() => addPlatform(Platform.Web)}
                                leadingIcon={IconCode}>
                                Web
                            </ActionMenu.Item.Button>
                            <ActionMenu.Item.Button
                                on:click={() => addPlatform(Platform.Flutter)}
                                leadingIcon={IconFlutter}>
                                Flutter
                            </ActionMenu.Item.Button>
                            <ActionMenu.Item.Button
                                on:click={() => addPlatform(Platform.Android)}
                                leadingIcon={IconAndroid}>
                                Android
                            </ActionMenu.Item.Button>
                            <ActionMenu.Item.Button
                                on:click={() => addPlatform(Platform.Apple)}
                                leadingIcon={IconApple}>
                                Apple
                            </ActionMenu.Item.Button>
                            <ActionMenu.Item.Button
                                on:click={() => addPlatform(Platform.ReactNative)}
                                leadingIcon={IconReact}>
                                React Native
                            </ActionMenu.Item.Button>
                        </ActionMenu.Root>
                    </svelte:fragment>
                </Popover>
            </svelte:fragment>
        </Empty>
    </Card.Base>
{/if}
