<script lang="ts">
    import { InputLine } from '$lib/elements/forms';
    import type { Models } from '@appwrite.io/console';
    import { Layout, Typography } from '@appwrite.io/pink-svelte';

    export let id: string;
    export let label: string;
    export let value: number[][] | null = null;
    export let limited: boolean = false;
    export let column: Models.ColumnInteger;
    const defaultShape = [
        [0, 0],
        [0, 0]
    ];
    function onAddPoint() {
        value = [...(value || defaultShape), [0, 0]];
    }

    function onDeletePoint() {
        if (value && value?.length > 2) value = value.slice(0, value.length - 1);
    }

    $: nullable = !limited ? !column.required : false;
</script>

<Layout.Stack>
    <Layout.Stack direction="row" alignItems="center" gap="s">
        <Typography.Text variant="m-600">{label}</Typography.Text>
        {#if nullable}
            <Typography.Caption variant="400">optional</Typography.Caption>
        {/if}
    </Layout.Stack>

    <InputLine values={value} showDefaults={false} {onAddPoint} {onDeletePoint} />
</Layout.Stack>
