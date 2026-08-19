<script lang="ts">
    import { setOverviewAction } from '../context';
    import Table from '../(components)/table.svelte';
    import { Alert, Layout, Typography } from '@appwrite.io/pink-svelte';

    let { data } = $props();

    setOverviewAction(null);
</script>

<Layout.Stack gap="l">
    <Alert.Inline status="warning" title="Dev keys are deprecated">
        <Typography.Text>
            As of July 22, 2026, creating new dev keys is paused. Existing dev keys keep working
            until September 1, 2026. Learn more in the
            <a
                href="https://appwrite.io/changelog/entry/2026-07-22"
                target="_blank"
                rel="noopener noreferrer"
                style="text-decoration: underline;">
                changelog
            </a>.
        </Typography.Text>
    </Alert.Inline>

    <Table keys={data.devKeys} keyType="dev" />
</Layout.Stack>
