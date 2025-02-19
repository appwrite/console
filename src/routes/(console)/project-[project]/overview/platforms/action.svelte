<script>
    import DropList from '$lib/components/dropList.svelte';
    import DropListItem from '$lib/components/dropListItem.svelte';
    import Button from '$lib/elements/forms/button.svelte';
    import { canWritePlatforms } from '$lib/stores/roles';
    import { Icon } from '@appwrite.io/pink-svelte';
    import { addPlatform, Platform } from './+page.svelte';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';

    let showDropdown = false;
</script>

{#if $canWritePlatforms}
    <DropList bind:show={showDropdown} placement="bottom-start">
        <Button on:click={() => (showDropdown = !showDropdown)}>
            <Icon icon={IconPlus} slot="start" size="s" />
            Add platform
        </Button>
        <svelte:fragment slot="list">
            <DropListItem on:click={() => addPlatform(Platform.Web)}>Web app</DropListItem>
            <DropListItem on:click={() => addPlatform(Platform.Flutter)}>Flutter app</DropListItem>
            <DropListItem on:click={() => addPlatform(Platform.Android)}>Android app</DropListItem>
            <DropListItem on:click={() => addPlatform(Platform.Apple)}>Apple app</DropListItem>
            <DropListItem on:click={() => addPlatform(Platform.ReactNative)}
                >React Native app</DropListItem>
        </svelte:fragment>
    </DropList>
{/if}
