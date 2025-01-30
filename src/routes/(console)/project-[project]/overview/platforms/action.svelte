<script>
    import DropList from '$lib/components/dropList.svelte';
    import DropListItem from '$lib/components/dropListItem.svelte';
    import Button from '$lib/elements/forms/button.svelte';
    import { canWritePlatforms } from '$lib/stores/roles';
    import { addPlatform, Platform } from './+page.svelte';

    let showDropdown = false;
</script>

{#if $canWritePlatforms}
    <DropList bind:show={showDropdown} placement="bottom-start">
        <Button on:click={() => (showDropdown = !showDropdown)}>
            <span class="icon-plus" aria-hidden="true" />
            <span class="text">Add platform</span>
        </Button>
        <svelte:fragment slot="list">
            <DropListItem on:click={() => addPlatform(Platform.Flutter)}>Flutter app</DropListItem>
            <DropListItem on:click={() => addPlatform(Platform.Android)}>Android app</DropListItem>
            <DropListItem on:click={() => addPlatform(Platform.Apple)}>Apple app</DropListItem>
            <DropListItem on:click={() => addPlatform(Platform.ReactNative)}
                >React Native app</DropListItem>
        </svelte:fragment>
    </DropList>
{/if}
