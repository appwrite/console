<script lang="ts">
    import { BoxAvatar, CardGrid } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { Click, trackEvent } from '$lib/actions/analytics';
    import Delete from '../delete.svelte';
    import type { Models } from '@appwrite.io/console';
    import { Layout, Typography } from '@appwrite.io/pink-svelte';

    let {
        database
    }: {
        database: Models.DedicatedDatabase;
    } = $props();

    let showDelete = $state(false);

    function getEngineDisplayName(engine: string): string {
        switch (engine) {
            case 'postgres':
                return 'PostgreSQL';
            case 'mysql':
                return 'MySQL';
            case 'mariadb':
                return 'MariaDB';
            case 'mongodb':
                return 'MongoDB';
            default:
                return engine;
        }
    }
</script>

<CardGrid>
    <svelte:fragment slot="title">Delete database</svelte:fragment>
    The database will be permanently deleted, including all data and backups. This action is
    irreversible.
    <svelte:fragment slot="aside">
        <BoxAvatar>
            <svelte:fragment slot="title">
                <Layout.Stack direction="column" gap="xxs">
                    <h6 class="u-bold u-trim-1">{database.name}</h6>
                    <Layout.Stack direction="row" gap="s">
                        <Typography.Caption variant="400" color="--fgcolor-neutral-tertiary">
                            {getEngineDisplayName(database.engine)} {database.version}
                        </Typography.Caption>
                    </Layout.Stack>
                </Layout.Stack>
            </svelte:fragment>
            <p>Last updated: {toLocaleDateTime(database.$updatedAt)}</p>
        </BoxAvatar>
    </svelte:fragment>

    <svelte:fragment slot="actions">
        <Button
            danger
            on:click={() => {
                showDelete = true;
                trackEvent(Click.DatabaseDatabaseDelete);
            }}>
            Delete
        </Button>
    </svelte:fragment>
</CardGrid>

<Delete bind:showDelete />
