<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Button } from '$lib/elements/forms';
    import type { Models } from '@appwrite.io/console';
    import {
        IconCog,
        IconDotsHorizontal,
        IconGlobeAlt,
        IconUserAdd
    } from '@appwrite.io/pink-icons-svelte';

    import { ActionMenu, Icon, Popover } from '@appwrite.io/pink-svelte';

    export let site: Models.Site;
    export let showAddCollaborator = false;
    export let selectedSite: Models.Site = null;
</script>

<Popover padding="none" placement="bottom-end" let:toggle>
    <Button
        text
        icon
        size="s"
        on:click={(e) => {
            e.preventDefault();
            toggle(e);
        }}>
        <Icon size="s" icon={IconDotsHorizontal} /></Button>
    <svelte:fragment slot="tooltip" let:toggle>
        <ActionMenu.Root>
            <ActionMenu.Item.Button
                leadingIcon={IconUserAdd}
                on:click={(e) => {
                    e.preventDefault();
                    selectedSite = site;
                    showAddCollaborator = true;
                    toggle(e);
                }}>
                Add collaborator
            </ActionMenu.Item.Button>
            <ActionMenu.Item.Anchor
                href={`${base}/project-${page.params.project}/sites/site-${site.$id}/domains`}
                leadingIcon={IconGlobeAlt}>
                Domains
            </ActionMenu.Item.Anchor>
            <ActionMenu.Item.Anchor
                href={`${base}/project-${page.params.project}/sites/site-${site.$id}/settings`}
                leadingIcon={IconCog}>
                Settings
            </ActionMenu.Item.Anchor>
        </ActionMenu.Root>
    </svelte:fragment>
</Popover>
