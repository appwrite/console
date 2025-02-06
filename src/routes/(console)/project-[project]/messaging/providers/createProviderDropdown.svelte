<script lang="ts">
    import { DropList, DropListItem } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { wizard } from '$lib/stores/wizard';
    import { providers } from './store';
    import Create from './create.svelte';
    import { providerType, provider } from './wizard/store';
    import { Providers } from '../provider.svelte';
    import { isValueOfStringEnum } from '$lib/helpers/types';
    import { MessagingProviderType } from '@appwrite.io/console';
    import { Icon } from '@appwrite.io/pink-svelte';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';

    export let showCreateDropdown = false;
</script>

<DropList bind:show={showCreateDropdown} scrollable placement="bottom-end">
    <slot>
        <Button on:click={() => (showCreateDropdown = !showCreateDropdown)} event="create_provider">
            <Icon icon={IconPlus} slot="start" size="s" />
            Create provider
        </Button>
    </slot>
    <svelte:fragment slot="list">
        {#each Object.entries(providers) as [type, option]}
            <DropListItem
                icon={option.icon}
                on:click={() => {
                    if (
                        type !== MessagingProviderType.Email &&
                        type !== MessagingProviderType.Sms &&
                        type !== MessagingProviderType.Push
                    )
                        return;
                    $providerType = type;
                    const p = Object.keys(providers[type].providers).shift();
                    if (p && isValueOfStringEnum(Providers, p)) {
                        $provider = p;
                    }
                    showCreateDropdown = false;
                    wizard.start(Create);
                }}>
                {option.name}
            </DropListItem>
        {/each}
    </svelte:fragment>
</DropList>
