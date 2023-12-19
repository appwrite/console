<script lang="ts">
    import { DropList, DropListItem } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { wizard } from '$lib/stores/wizard';
    import { providers } from './providers/store';
    import Create from './create.svelte';
    import { messageParams, providerType, targetsById } from './wizard/store';
    import { ProviderTypes } from './providerType.svelte';
    import { topicsById } from './store';

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
                        type !== ProviderTypes.Email &&
                        type !== ProviderTypes.Sms &&
                        type !== ProviderTypes.Push
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
                        case ProviderTypes.Email:
                            $messageParams[$providerType] = {
                                ...common,
                                subject: '',
                                content: ''
                            };
                            break;
                        case ProviderTypes.Sms:
                            $messageParams[$providerType] = {
                                ...common,
                                content: ''
                            };
                            break;
                        case ProviderTypes.Push:
                            $messageParams[$providerType] = {
                                ...common,
                                title: '',
                                body: ''
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
