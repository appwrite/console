<script lang="ts">
    import { capitalize } from '$lib/helpers/string';
    import { IconChevronRight } from '@appwrite.io/pink-icons-svelte';
    import { ActionMenu, Card, Layout, Selector } from '@appwrite.io/pink-svelte';
    import { createMenubar, melt } from '@melt-ui/svelte';
    import { createEventDispatcher } from 'svelte';
    import type { ValidOperators } from './store';

    type FilterData = {
        title: string;
        id: string;
        array: boolean;
        show: boolean;
        tag: string;
        operator: ValidOperators;
        options: { value: string; label: string; checked: boolean }[];
    };

    export let filter: FilterData;
    export let variant: 'checkbox' | 'radio' = 'checkbox';

    const {
        builders: { createMenu }
    } = createMenubar();

    const {
        elements: { item: item, separator: separator },
        builders: { createSubmenu: createSubmenu, createMenuRadioGroup, createCheckboxItem }
    } = createMenu();

    const {
        elements: { checkboxItem: checkboxItem }
    } = createCheckboxItem();

    const {
        elements: { radioGroup: radioGroup }
    } = createMenuRadioGroup({});

    const {
        elements: { subMenu: subMenu, subTrigger: subTrigger }
    } = createSubmenu();

    const dispatch = createEventDispatcher();
</script>

<div use:melt={$subTrigger}>
    <ActionMenu.Root>
        <ActionMenu.Item.Button trailingIcon={IconChevronRight}
            >{filter.title}</ActionMenu.Item.Button>
    </ActionMenu.Root>
</div>

<div class="menu subMenu" use:melt={$subMenu}>
    <Card.Base padding="xxxs">
        <div use:melt={$radioGroup}>
            {#each filter.options as option (option.value + option.checked)}
                {#if variant === 'radio'}
                    <div use:melt={$item}>
                        <ActionMenu.Root>
                            <ActionMenu.Item.Button
                                on:click={() => {
                                    option.checked = !option.checked;
                                    dispatch('add', {
                                        value: filter?.array
                                            ? null
                                            : option.checked
                                              ? option.value
                                              : null
                                    });
                                }}>
                                {capitalize(option.label)}
                            </ActionMenu.Item.Button>
                        </ActionMenu.Root>
                    </div>
                {:else}
                    <div use:melt={$checkboxItem}>
                        <ActionMenu.Root>
                            <ActionMenu.Item.Button
                                on:click={() => {
                                    option.checked = !option.checked;
                                    dispatch('add', {
                                        value: filter?.array
                                            ? null
                                            : option.checked
                                              ? option.value
                                              : null
                                    });
                                }}>
                                <Layout.Stack direction="row" gap="s">
                                    <Selector.Checkbox bind:checked={option.checked} />
                                    {capitalize(option.label)}
                                </Layout.Stack>
                            </ActionMenu.Item.Button>
                        </ActionMenu.Root>
                    </div>
                {/if}
            {/each}
            {#if filter.options.some((option) => option.checked)}
                <div class="separator" use:melt={$separator} />
                <div use:melt={$item}>
                    <ActionMenu.Root>
                        <ActionMenu.Item.Button
                            on:click={() => {
                                dispatch('clear');
                            }}>
                            Clear all
                        </ActionMenu.Item.Button>
                    </ActionMenu.Root>
                </div>
            {/if}
        </div>
    </Card.Base>
</div>

<style>
    .menu {
        min-width: 244px;
        z-index: 20;
    }
</style>
