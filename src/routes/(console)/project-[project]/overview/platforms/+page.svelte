<script lang="ts" context="module">
    import SearchDark from '$lib/images/search-dark.svg';
    import SearchLight from '$lib/images/search-light.svg';
    import { wizard } from '$lib/stores/wizard';
    import CreateAndroid from './createAndroid.svelte';
    import CreateApple from './createApple.svelte';
    import CreateFlutter from './createFlutter.svelte';
    import CreateReactNative from './createReactNative.svelte';
    import { createPlatform, versions } from './wizard/store';

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
        wizard.start(platforms[platform], null, 1, {
            isPlatformCreated: true,
            platform: type
        });
    }

    const platforms = {
        [Platform.Flutter]: CreateFlutter,
        [Platform.Android]: CreateAndroid,
        [Platform.Apple]: CreateApple,
        [Platform.ReactNative]: CreateReactNative
    };
</script>

<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { DropList, DropListItem, Heading } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { toLocaleDate } from '$lib/helpers/date';
    import { app } from '$lib/stores/app';
    import type { PageData } from './$types';
    import { canWritePlatforms } from '$lib/stores/roles';
    import { setOverviewAction } from '../context';
    import { Table } from '@appwrite.io/pink-svelte';
    import Action from './action.svelte';

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
    let showDropdownEmpty = false;
    const path = `${base}/project-${$page.params.project}/overview/platforms`;

    const getPlatformInfo = (platform: string) => {
        if (platform.includes('flutter')) {
            return 'color/flutter';
        } else if (platform.includes('react-native')) {
            return 'color/react';
        } else if (platform.includes('apple')) {
            return 'color/apple';
        } else if (platform.includes('android')) {
            return 'color/android';
        } else {
            return 'unknown';
        }
    };

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
                    {PlatformTypes[platform.type]}
                </Table.Cell>
                <Table.Cell>
                    {platform.$updatedAt ? toLocaleDate(platform.$updatedAt) : 'never'}
                </Table.Cell>
            </Table.Link>
        {/each}
    </Table.Root>
{:else}
    <article class="card u-grid u-cross-center u-width-full-line common-section">
        <div class="u-flex u-flex-vertical u-cross-center u-gap-24">
            {#if $app.themeInUse === 'dark'}
                <img src={SearchDark} alt="empty" aria-hidden="true" />
            {:else}
                <img src={SearchLight} alt="empty" aria-hidden="true" />
            {/if}
            <slot>
                <div class="u-text-center">
                    <Heading size="7" tag="h4">Create a platform to get started.</Heading>
                    <p class="body-text-2 u-bold u-margin-block-start-4">
                        Need a hand? Learn more in our documentation.
                    </p>
                </div>
                <div class="u-flex u-gap-16 u-main-center">
                    <Button external href="https://appwrite.io/docs/sdks" text>
                        Documentation
                    </Button>
                    <DropList bind:show={showDropdownEmpty} placement="bottom-start">
                        {#if $canWritePlatforms}
                            <Button
                                secondary
                                on:click={() => (showDropdownEmpty = !showDropdownEmpty)}>
                                <span class="text">Add platform</span>
                            </Button>
                        {/if}
                        <svelte:fragment slot="list">
                            <DropListItem on:click={() => addPlatform(Platform.Flutter)}>
                                Flutter
                            </DropListItem>
                            <DropListItem on:click={() => addPlatform(Platform.Android)}>
                                Android
                            </DropListItem>
                            <DropListItem on:click={() => addPlatform(Platform.Apple)}>
                                Apple
                            </DropListItem>
                            <DropListItem on:click={() => addPlatform(Platform.ReactNative)}>
                                React Native
                            </DropListItem>
                        </svelte:fragment>
                    </DropList>
                </div>
            </slot>
        </div>
    </article>
{/if}
