<script lang="ts">
    import { WizardStep } from '$lib/layout';
    import { Button } from '$lib/elements/forms';
    import { DropList, DropListItem } from '$lib/components';
    // import { createFunction } from './store';

    let showDropdown = false;
    let showUsers = false;
    let showTeams = false;
</script>

<WizardStep>
    <svelte:fragment slot="title">Execute access (optional)</svelte:fragment>
    <svelte:fragment slot="subtitle">
        Choose who can execute this function using the client API. Check out our documentation for
        more on <a href="#/" target="_blank" rel="noopener noreferrer" class="link">
            Permissions</a
        >.
    </svelte:fragment>

    ROLE

    <DropList bind:show={showDropdown} position="bottom" arrow={false}>
        <Button text on:click={() => (showDropdown = !showDropdown)}>
            <span class="icon-plus" aria-hidden="true" />
            <span class="u-text">Add role</span>
        </Button>

        <svelte:fragment slot="list">
            <DropListItem>Any</DropListItem>
            <DropListItem>All guests</DropListItem>
            <DropListItem>All users</DropListItem>
            <DropListItem on:click={() => (showUsers = true)}>Select users</DropListItem>
            <DropListItem on:click={() => (showTeams = true)}>Select teams</DropListItem>
        </svelte:fragment>
    </DropList>
</WizardStep>
