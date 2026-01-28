<script lang="ts">
    import Button from '$lib/elements/forms/button.svelte';
    import { canWritePlatforms } from '$lib/stores/roles';
    import { ActionMenu, Icon, Popover, Tooltip } from '@appwrite.io/pink-svelte';
    import { addPlatform, Platform } from './+page.svelte';
    import {
        IconAndroid,
        IconApple,
        IconCode,
        IconFlutter,
        IconPlus,
        IconReact
    } from '@appwrite.io/pink-icons-svelte';
    import { isCloud } from '$lib/system';
    import { currentPlan } from '$lib/stores/organization';
    import { page } from '$app/state';
</script>

{#if $canWritePlatforms}
    {#if isCloud && $currentPlan?.platforms >= page.data.platforms.total}
        <Tooltip maxWidth="200px">
            <div>
                <Button disabled>
                    <Icon icon={IconPlus} slot="start" />
                    <span class="text">Add platform</span>
                </Button>
            </div>

            <svelte:fragment slot="tooltip">
                You have reached the maximum number of platforms for your plan in a project.
            </svelte:fragment>
        </Tooltip>
    {:else}
        <Popover let:toggle padding="none" placement="bottom-end">
            {#if $canWritePlatforms}
                <Button on:click={toggle}>
                    <Icon icon={IconPlus} slot="start" />
                    <span class="text">Add platform</span>
                </Button>
            {/if}
            <div style:min-width="232px" slot="tooltip">
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
            </div>
        </Popover>
    {/if}
{/if}
