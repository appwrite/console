<script>
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
</script>

<Popover let:toggle padding="none" placement="bottom-end">
    <Tooltip disabled={$canWritePlatforms}>
        <Button on:click={toggle} disabled={!$canWritePlatforms}>
            <Icon icon={IconPlus} slot="start" />
            <span class="text">Add platform</span>
        </Button>
        <div slot="tooltip">Your role does not allow this action</div>
    </Tooltip>
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
