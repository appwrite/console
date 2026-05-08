<script lang="ts">
    import { Card, Layout } from '@appwrite.io/pink-svelte';

    interface PolicyPreset {
        id: string;
        label: string;
        description: string;
    }

    interface Props {
        policies: PolicyPreset[];
        selected: string;
        columns?: number;
    }

    let { policies, selected = $bindable(), columns = 3 }: Props = $props();
</script>

<Layout.Grid {columns} columnsS={1}>
    {#each policies as policy}
        <Card.Selector
            variant="secondary"
            imageRadius="s"
            id={policy.id}
            name="backupPolicy"
            value={policy.id}
            title={policy.label}
            bind:group={selected}>
            {policy.description}
        </Card.Selector>
    {/each}
</Layout.Grid>
