<script lang="ts" context="module">
    import SearchDark from '$lib/images/search-dark.svg';
    import SearchLight from '$lib/images/search-light.svg';
    import { wizard } from '$lib/stores/wizard';
    import CreateAndroid from './createAndroid.svelte';
    import CreateApple from './createApple.svelte';
    import CreateFlutter from './createFlutter.svelte';
    import CreateWeb from './createWeb.svelte';
    import CreateReactNative from './createReactNative.svelte';
    import { versions } from './wizard/store';

    export enum Platform {
        Web,
        Flutter,
        Android,
        Apple,
        ReactNative
    }

    export async function addPlatform(type: Platform) {
        await versions.load();
        wizard.start(platforms[type]);
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
    import { DropList, DropListItem, Heading } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { app } from '$lib/stores/app';
    import type { PageData } from './$types';
    import { ContainerHeader } from '$lib/layout';
    import { canWritePlatforms } from '$lib/stores/roles';

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
        'web' = 'Web',
        'react-native-android' = 'Android',
        'react-native-ios' = 'iOS'
    }
    let showDropdown = false;
    let showDropdownEmpty = false;
    const path = `${base}/project-${$page.params.region}-${$page.params.project}/overview/platforms`;

    const getPlatformInfo = (platform: string) => {
        if (platform.includes('flutter')) {
            return 'color/flutter';
        } else if (platform.includes('react-native')) {
            return 'color/react';
        } else if (platform.includes('apple')) {
            return 'color/apple';
        } else if (platform.includes('android')) {
            return 'color/android';
        } else if (platform.includes('web')) {
            return 'grayscale/code';
        } else {
            return 'unknown';
        }
    };
</script>

<ContainerHeader
    title="Platforms"
    titleTag="h3"
    titleSize="7"
    total={data?.platforms?.total}
    let:isButtonDisabled>
    <DropList bind:show={showDropdown} placement="bottom-start">
        {#if $canWritePlatforms}
            <Button on:click={() => (showDropdown = !showDropdown)} disabled={isButtonDisabled}>
                <span class="icon-plus" aria-hidden="true" />
                <span class="text">Add platform</span>
            </Button>
        {/if}
        <svelte:fragment slot="list">
            <DropListItem on:click={() => addPlatform(Platform.Web)}>Web app</DropListItem>
            <DropListItem on:click={() => addPlatform(Platform.Flutter)}>Flutter app</DropListItem>
            <DropListItem on:click={() => addPlatform(Platform.Android)}>Android app</DropListItem>
            <DropListItem on:click={() => addPlatform(Platform.Apple)}>Apple app</DropListItem>
            <DropListItem on:click={() => addPlatform(Platform.ReactNative)}
                >React Native app</DropListItem>
        </svelte:fragment>
    </DropList>
</ContainerHeader>

{#if data.platforms.platforms.length}
    <div
        class="grid-box u-margin-block-start-32"
        style="--grid-gap:1.5rem; --grid-item-size:20rem;"
        data-private>
        {#each data.platforms.platforms as platform}
            <a class="card" href={`${path}/${platform.$id}`}>
                <div class="grid-item-1" style="min-block-size: calc(182 / 16 * 1rem)">
                    <div class="grid-item-1-start-start">
                        <div class="u-flex u-gap-16 u-cross-center">
                            <div class="avatar is-medium" aria-hidden="true">
                                <img
                                    src={`${base}/icons/${$app.themeInUse}/${getPlatformInfo(
                                        platform.type.toLowerCase()
                                    )}.svg`}
                                    alt="technology" />
                            </div>
                            <div>
                                <Heading size="6" tag="h3">{platform.name}</Heading>
                                <p class="text">{PlatformTypes[platform.type]}</p>
                            </div>
                        </div>
                    </div>

                    <div class="grid-item-1-end-start">
                        <div class="u-flex u-gap-16 u-flex-wrap">
                            <div class="grid-item-1-end-start">
                                <p class="eyebrow-heading-3">Last updated</p>
                                <p>{toLocaleDateTime(platform.$updatedAt)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </a>
        {/each}
    </div>
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
                            <DropListItem on:click={() => addPlatform(Platform.Web)}>
                                Web
                            </DropListItem>
                            <DropListItem on:click={() => addPlatform(Platform.Flutter)}>
                                Flutter
                            </DropListItem>
                            <DropListItem on:click={() => addPlatform(Platform.Android)}>
                                Android
                            </DropListItem>
                            <DropListItem on:click={() => addPlatform(Platform.Apple)}>
                                Apple
                            </DropListItem>
                        </svelte:fragment>
                    </DropList>
                </div>
            </slot>
        </div>
    </article>
{/if}
