<script lang="ts">
    import { Layout, Selector, Tag, Spinner, Typography } from '@appwrite.io/pink-svelte';

    export let label: string;
    export let checked: boolean;
    export let isLoading: boolean = false;
    export let handleChange: (event: Event) => void;
    export let description: string | undefined = undefined;
    export let reportValue: string | number | undefined = undefined;
</script>

<Layout.Stack>
    <Layout.Stack direction="row" gap="xs" alignItems="flex-start">
        <Layout.Stack gap="none">
            <Layout.Stack direction="row" gap="xs" alignItems="flex-start">
                <Selector.Checkbox {label} bind:checked on:change={handleChange} />

                {#if reportValue !== undefined}
                    <Tag size="xs" selected>{reportValue}</Tag>
                {:else if isLoading}
                    <Spinner size="s" />
                {/if}
            </Layout.Stack>

            {#if description}
                <div style:padding-left="2rem">
                    <Typography.Text variant="m-400" color="--fgcolor-neutral-tertiary">
                        {description}
                    </Typography.Text>
                </div>
            {/if}
        </Layout.Stack>
    </Layout.Stack>
</Layout.Stack>
