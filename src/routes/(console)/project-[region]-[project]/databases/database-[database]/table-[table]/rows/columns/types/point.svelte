<script lang="ts">
    import { InputPoint } from '$lib/elements/forms';
    import type { Models } from '@appwrite.io/console';
    import { Layout, Typography } from '@appwrite.io/pink-svelte';

    export let id: string;
    export let label: string;
    export let value: number[];
    export let limited: boolean = false;
    export let column: Models.ColumnInteger;

    $: nullable = !limited ? !column.required : false;
</script>

<Layout.Stack>
    <Layout.Stack direction="row" alignItems="center" gap="s">
        <Typography.Text variant="m-600">{label}</Typography.Text>
        {#if nullable}
            <Typography.Caption variant="400">optional</Typography.Caption>
        {/if}
    </Layout.Stack>
    <InputPoint values={value || [0, 0]} showDefaults={false} />
</Layout.Stack>
