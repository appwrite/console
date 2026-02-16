<script lang="ts" module>
    import { columns } from './store';
    import { wizard } from '$lib/stores/wizard';
    import CreateAndroid from './createAndroid.svelte';
    import CreateApple from './createApple.svelte';
    import CreateFlutter from './createFlutter.svelte';
    import CreateReactNative from './createReactNative.svelte';
    import CreateWeb from './createWeb.svelte';
    import { createPlatform } from './wizard/store';
    import { Click, trackEvent } from '$lib/actions/analytics';
    import type { PlatformType } from '@appwrite.io/console';

    export enum Platform {
        Web,
        Flutter,
        Android,
        Apple,
        ReactNative
    }

    export async function addPlatform(type: Platform) {
        createPlatform.reset();
        wizard.start(platforms[type]);
        trackEvent(Click.PlatformCreateClick, {
            platform: platforms[type],
            source: 'platforms_page'
        });
    }

    export async function continuePlatform(
        platform: Platform,
        name: string,
        key: string,
        type: PlatformType
    ) {
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
    import { resolve } from '$app/paths';
    import { Button } from '$lib/elements/forms';
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

    import { page } from '$app/state';
    import type { PageProps } from './$types';
    import type { Models } from '@appwrite.io/console';
    import {
        type DeleteOperationState,
        type DeleteOperation,
        MultiSelectionTable
    } from '$lib/components';
    import { sdk } from '$lib/stores/sdk';
    import { Submit, trackError } from '$lib/actions/analytics';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';

    const { data }: PageProps = $props();

    const PlatformTypes = {
        'apple-ios': 'iOS',
        'apple-macos': 'macOS',
        'apple-watchos': 'watchOS',
        'apple-tvos': 'tvOS',
        android: 'Android',
        'flutter-android': 'Android',
        'flutter-ios': 'iOS',
        'flutter-linux': 'Linux',
        'flutter-macos': 'macOS',
        'flutter-windows': 'Windows',
        'flutter-web': 'Web',
        'react-native-android': 'Android',
        'react-native-ios': 'iOS',
        web: 'Web'
    } as const;

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

    function getPlatformPath(platform: Models.Platform) {
        return resolve('/(console)/project-[region]-[project]/overview/platforms/[platform]', {
            region: page.params.region,
            project: page.params.project,
            platform: platform.$id
        });
    }

    async function handlePlatformDelete(
        batchDelete: DeleteOperation
    ): Promise<DeleteOperationState> {
        const result = await batchDelete((platformId) =>
            sdk.forConsole.projects.deletePlatform({
                projectId: page.params.project,
                platformId
            })
        );

        try {
            if (result.error) {
                trackError(result.error, Submit.PlatformDelete);
            } else {
                trackEvent(Submit.PlatformDelete, { total: result.deleted.length });
            }
        } finally {
            await invalidate(Dependencies.PROJECT);
        }

        return result;
    }

    setOverviewAction(Action);
</script>

{#if data.platforms.total}
    <MultiSelectionTable
        resource="platform"
        columns={$columns}
        onDelete={handlePlatformDelete}
        allowSelection={false}>
        {#snippet header(root)}
            {#each $columns as column}
                <Table.Header.Cell {root} column={column.id}>
                    {column.title}
                </Table.Header.Cell>
            {/each}
        {/snippet}

        {#snippet children(root)}
            {#each data.platforms.platforms as platform}
                <Table.Row.Link href={getPlatformPath(platform)} {root} id={platform.$id}>
                    <Table.Cell {root}>
                        {platform.name}
                    </Table.Cell>
                    <Table.Cell {root}>
                        <Layout.Stack direction="row" gap="s" alignItems="center">
                            <Icon icon={getPlatformInfo(platform.type)} />
                            {PlatformTypes[platform.type]}
                        </Layout.Stack>
                    </Table.Cell>
                    <Table.Cell {root}>
                        {#if platform.type.includes('web') || platform.type === 'web'}
                            {platform.hostname || '—'}
                        {:else}
                            {platform.key || platform.hostname || '—'}
                        {/if}
                    </Table.Cell>
                    <Table.Cell {root}>
                        {#if platform.$updatedAt}
                            <DualTimeView time={platform.$updatedAt} />
                        {:else}
                            never
                        {/if}
                    </Table.Cell>
                </Table.Row.Link>
            {/each}
        {/snippet}
    </MultiSelectionTable>
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
