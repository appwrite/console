<script lang="ts">
    import {
        Accordion,
        Badge,
        Layout,
        Selector,
        Spinner,
        Typography
    } from '@appwrite.io/pink-svelte';
    import type { MigrationFormData } from '$lib/stores/migration';
    import { Button } from '$lib/elements/forms';

    export let error: boolean = false;
    export let groupKey: keyof MigrationFormData;
    export let formGroup: MigrationFormData[typeof groupKey];
    export let reportValue: string | number | undefined = undefined;

    const labelMap = {
        users: { root: 'Users', teams: 'Include teams' },
        databases: { root: 'Databases', documents: 'Include documents' },
        functions: {
            root: 'Functions',
            env: 'Include environment variables',
            inactive: 'Include inactive deployments'
        },
        storage: { root: 'Storage' }
    };

    const descriptionMap = {
        users: {
            root: 'Import all users',
            teams: 'Import all teams and the team memberships of your users'
        },
        databases: {
            root: 'Import all databases, including collections, indexes and attributes',
            documents: 'Import all documents inside collections'
        },
        functions: {
            root: 'Import all functions and their active deployment',
            env: 'Import all environment variables',
            inactive: 'Import all deployments that are not currently active'
        }
    };

    $: formGroupChildren = Object.keys(formGroup).filter((key) => key !== 'root');

    let parentState: boolean | 'indeterminate';

    $: {
        const total = formGroupChildren.length;
        const checked = formGroupChildren.filter((key) => formGroup[key]).length;

        if (checked === 0) {
            parentState = false;
        } else if (checked === total) {
            parentState = true;
        } else {
            parentState = 'indeterminate';
        }
    }

    function onParentChange(event: CustomEvent<boolean | 'indeterminate'>) {
        if (event.detail === 'indeterminate') return;
        for (const key of Object.keys(formGroup)) {
            formGroup[key] = event.detail;
        }
    }

    $: isLoading = !error;
</script>

{#if !formGroupChildren.length}
    <div style:padding-inline-start="0.5rem">
        <Button extraCompact on:click={() => (formGroup.root = !formGroup.root)}>
            <Layout.Stack direction="row" gap="s" alignItems="center">
                <Layout.Stack inline direction="row" gap="l" alignItems="flex-start">
                    <Selector.Checkbox size="s" bind:checked={formGroup.root} />

                    <Typography.Text variant="m-500" color="--fgcolor-neutral-primary">
                        {labelMap[groupKey]?.root ?? groupKey}
                    </Typography.Text>
                </Layout.Stack>

                {#if reportValue !== undefined}
                    <Badge size="xs" variant="secondary" content={String(reportValue)} />
                {:else if isLoading}
                    <Spinner size="s" />
                {/if}
            </Layout.Stack>
        </Button>
    </div>
{:else}
    <Accordion
        selectable
        bind:checked={parentState}
        on:change={onParentChange}
        title={labelMap[groupKey]?.root ?? groupKey}
        badge={error ? undefined : isLoading && reportValue ? reportValue.toString() : '...'}>
        <Layout.Stack gap="m">
            {#each formGroupChildren as key}
                <div style:margin-inline-start="6px" style:margin-block-start="6px">
                    <Selector.Checkbox
                        size="s"
                        id={key}
                        bind:checked={formGroup[key]}
                        label={labelMap[groupKey]?.[key] ?? key}
                        description={descriptionMap[groupKey]?.[key]} />
                </div>
            {/each}
        </Layout.Stack>
    </Accordion>
{/if}
