<script lang="ts">
    import { DropList, DropListItem } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { wizard } from '$lib/stores/wizard';
    import { providers } from './store';
    import Create from './create.svelte';
    import { providerType, provider } from './wizard/store';
    import { ProviderTypes } from '../providerType.svelte';
    import { Providers } from '../provider.svelte';

    export let showCreateDropdown = false;

    const isValueOfStringEnum = <T extends Record<string, string>>(
        enumType: T,
        value: string
    ): value is T[keyof T] => Object.values<string>(enumType).includes(value);
</script>

<DropList bind:show={showCreateDropdown} scrollable>
    <slot>
        <Button on:click={() => (showCreateDropdown = !showCreateDropdown)} event="create_provider">
            <span class="icon-plus" aria-hidden="true" />
            <span class="text">Create provider</span>
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
