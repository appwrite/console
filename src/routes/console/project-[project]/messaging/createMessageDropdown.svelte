<script lang="ts">
    import { DropList, DropListItem } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { wizard } from '$lib/stores/wizard';
    import { providers } from './providers/store';
    import Create from './create.svelte';
    import { messageParams, providerType, targetsById } from './wizard/store';
    import { topicsById } from './store';
    import { MessagingProviderType } from '@appwrite.io/console';

    export let showCreateDropdown = false;
</script>

<DropList bind:show={showCreateDropdown} scrollable placement="bottom-end">
    <slot>
        <Button on:click={() => (showCreateDropdown = !showCreateDropdown)} event="create_message">
            <span class="icon-plus" aria-hidden="true" />
            <span class="text">Create message</span>
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
                    $topicsById = {};
                    $targetsById = {};
                    const common = {
                        topics: [],
                        users: [],
                        targets: []
                    };
                    switch (type) {
                        case MessagingProviderType.Email:
                            $messageParams[$providerType] = {
                                ...common,
                                subject: '',
                                content: ''
                            };
                            break;
                        case MessagingProviderType.Sms:
                            $messageParams[$providerType] = {
                                ...common,
                                content: ''
                            };
                            break;
                        case MessagingProviderType.Push:
                            $messageParams[$providerType] = {
                                ...common,
                                title: '',
                                body: '',
                                data: [['', '']]
                            };
                            break;
                    }
                    showCreateDropdown = false;
                    wizard.start(Create);
                }}>
                {option.name}
            </DropListItem>
        {/each}
    </svelte:fragment>
</DropList>
