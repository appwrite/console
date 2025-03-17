<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { wizard } from '$lib/stores/wizard';
    import { providers } from './store';
    import Create from './create.svelte';
    import { providerType, provider } from './wizard/store';
    import { Providers } from '../provider.svelte';
    import { isValueOfStringEnum } from '$lib/helpers/types';
    import { MessagingProviderType } from '@appwrite.io/console';
    import { ActionMenu, Icon, Popover } from '@appwrite.io/pink-svelte';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';
</script>

<Popover let:toggle padding="none" placement="bottom-end">
    <Button on:click={toggle} event="create_provider">
        <Icon icon={IconPlus} slot="start" size="s" />
        Create provider
    </Button>
    <ActionMenu.Root slot="tooltip">
        {#each Object.entries(providers) as [type, option]}
            <ActionMenu.Item.Button
                leadingIcon={option.icon}
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
                    wizard.start(Create);
                }}>
                {option.name}
            </ActionMenu.Item.Button>
        {/each}
    </ActionMenu.Root>
</Popover>
