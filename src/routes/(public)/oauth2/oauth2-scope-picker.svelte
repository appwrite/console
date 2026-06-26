<script lang="ts">
    import {
        Accordion,
        Badge,
        Divider,
        Layout,
        Selector,
        Typography
    } from '@appwrite.io/pink-svelte';
    import { InputSearch, Button } from '$lib/elements/forms';
    import {
        describeAction,
        type ActionCatalog,
        type ActionDescriptor
    } from '$lib/helpers/oauth2-authorization-details';

    interface Props {
        /** Requested actions for a single appwrite_console entry. */
        actions: string[];
        catalog: ActionCatalog;
        /** action -> granted. Two-way bound so the parent reads the selection. */
        selected: Record<string, boolean>;
        disabled?: boolean;
    }

    let { actions, catalog, selected = $bindable(), disabled = false }: Props = $props();

    let search = $state('');

    // Describe + sort every requested action once. Deprecated actions sink to
    // the bottom of their category so the common ones lead.
    const described = $derived<ActionDescriptor[]>(
        actions
            .map((action) => describeAction(action, catalog))
            .sort((a, b) => {
                if (a.category !== b.category) return a.category.localeCompare(b.category);
                if (a.deprecated !== b.deprecated) return a.deprecated ? 1 : -1;
                return a.action.localeCompare(b.action);
            })
    );

    const visible = $derived.by(() => {
        const term = search.trim().toLowerCase();
        if (!term) return described;
        return described.filter(
            (d) =>
                d.action.toLowerCase().includes(term) ||
                d.title.toLowerCase().includes(term) ||
                d.description.toLowerCase().includes(term) ||
                d.category.toLowerCase().includes(term)
        );
    });

    const categories = $derived(Array.from(new Set(visible.map((d) => d.category))));

    const selectedCount = $derived(actions.filter((action) => selected[action]).length);

    function actionsInCategory(category: string): ActionDescriptor[] {
        return visible.filter((d) => d.category === category);
    }

    function categoryState(category: string): boolean | 'indeterminate' {
        const inCategory = actionsInCategory(category);
        const active = inCategory.filter((d) => selected[d.action]).length;
        if (active === 0) return false;
        if (active === inCategory.length) return true;
        return 'indeterminate';
    }

    function onCategoryChange(event: CustomEvent<boolean | 'indeterminate'>, category: string) {
        if (disabled || event.detail === 'indeterminate') return;
        for (const d of actionsInCategory(category)) {
            selected[d.action] = event.detail;
        }
    }

    function setAll(value: boolean) {
        if (disabled) return;
        // Only flips what is currently visible (respects an active search).
        for (const d of visible) {
            selected[d.action] = value;
        }
    }
</script>

<Layout.Stack gap="m">
    <Layout.Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        gap="s"
        wrap="wrap">
        <Layout.Stack direction="row" alignItems="baseline" gap="xs" inline>
            <Typography.Text variant="m-500">Permissions</Typography.Text>
            <Typography.Text variant="m-400" color="--fgcolor-neutral-tertiary">
                {selectedCount}/{actions.length}
            </Typography.Text>
        </Layout.Stack>
        <Layout.Stack direction="row" alignItems="center" gap="s" inline>
            <Button
                compact
                disabled={disabled || selectedCount === actions.length}
                on:click={() => setAll(true)}>
                Select all
            </Button>
            <span style:height="20px"><Divider vertical /></span>
            <Button
                compact
                disabled={disabled || selectedCount === 0}
                on:click={() => setAll(false)}>
                Deselect all
            </Button>
        </Layout.Stack>
    </Layout.Stack>

    {#if actions.length > 6}
        <InputSearch bind:value={search} placeholder="Search permissions" {disabled} />
    {/if}

    {#if categories.length === 0}
        <Typography.Text variant="m-400" color="--fgcolor-neutral-tertiary">
            No permissions match “{search}”.
        </Typography.Text>
    {:else}
        <!-- Bounded + internally scrollable so the card stays a sensible height
             and the Authorize / Cancel actions remain visible no matter how many
             permissions are requested. -->
        <div class="scope-scroll">
            <Layout.Stack gap="none">
                <Divider />
                {#each categories as category, index (category)}
                    {@const inCategory = actionsInCategory(category)}
                    {@const activeCount = inCategory.filter((d) => selected[d.action]).length}
                    <Accordion
                        selectable={!disabled}
                        title={category}
                        hideDivider={index === categories.length - 1}
                        badge={`${activeCount}/${inCategory.length}`}
                        checked={categoryState(category)}
                        on:change={(event) => onCategoryChange(event, category)}>
                        <Layout.Stack gap="m">
                            {#each inCategory as action (action.action)}
                                <Layout.Stack
                                    inline
                                    direction="row"
                                    alignItems="flex-start"
                                    gap="s">
                                    <Selector.Checkbox
                                        size="s"
                                        id={`rar-${action.action}`}
                                        {disabled}
                                        bind:checked={selected[action.action]} />
                                    <Layout.Stack gap="xxs">
                                        <label for={`rar-${action.action}`}>
                                            <Layout.Stack gap="xxs">
                                                <Layout.Stack
                                                    inline
                                                    direction="row"
                                                    alignItems="center"
                                                    gap="xxs">
                                                    <Typography.Text variant="m-500">
                                                        {action.action}
                                                    </Typography.Text>
                                                    {#if action.deprecated}
                                                        <Badge
                                                            size="xs"
                                                            variant="secondary"
                                                            content="Deprecated" />
                                                    {/if}
                                                </Layout.Stack>
                                                <Typography.Text
                                                    variant="m-400"
                                                    color="--fgcolor-neutral-tertiary">
                                                    {action.description}
                                                </Typography.Text>
                                            </Layout.Stack>
                                        </label>
                                    </Layout.Stack>
                                </Layout.Stack>
                            {/each}
                        </Layout.Stack>
                    </Accordion>
                {/each}
            </Layout.Stack>
        </div>
    {/if}
</Layout.Stack>

<style>
    .scope-scroll {
        max-height: 22rem;
        overflow-y: auto;
        /* Keep the right edge clear of the scrollbar. */
        margin-right: -0.25rem;
        padding-right: 0.25rem;
    }

    label {
        cursor: pointer;
    }
</style>
