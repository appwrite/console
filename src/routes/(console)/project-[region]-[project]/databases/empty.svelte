<script lang="ts">
    import { app } from '$lib/stores/app';
    import { Card } from '$lib/components';

    import { IconArrowRight } from '@appwrite.io/pink-icons-svelte';
    import { Layout, Typography, Icon, Divider } from '@appwrite.io/pink-svelte';

    import TablesDB from './(assets)/tables-db.svg';
    import TablesDBDark from './(assets)/dark/tables-db.svg';

    import DocumentsDB from './(assets)/documents-db.svg';
    import DocumentsDBDark from './(assets)/dark/documents-db.svg';

    import VectorsDB from './(assets)/vectors-db.svg';
    import VectorsDBDark from './(assets)/dark/vectors-db.svg';

    import DedicatedDB from './(assets)/dedicated-db.svg';
    import DedicatedDBDark from './(assets)/dark/dedicated-db.svg';

    import { isSmallViewport } from '$lib/stores/viewport';
    import type { DatabaseType } from '$database/(entity)';
    import { databaseTypes } from './store';

    const {
        disabled,
        onDatabaseTypeSelected
    }: {
        disabled?: boolean;
        onDatabaseTypeSelected?: (type: DatabaseType) => Promise<void> | void;
    } = $props();

    const isDark = $derived($app.themeInUse === 'dark');

    const images: Record<string, string> = $derived({
        tablesdb: isDark ? TablesDBDark : TablesDB,
        documentsdb: isDark ? DocumentsDBDark : DocumentsDB,
        vectorsdb: isDark ? VectorsDBDark : VectorsDB,
        dedicateddb: isDark ? DedicatedDBDark : DedicatedDB
    });
</script>

{#if $isSmallViewport}
    {@render mainContentView()}
{:else}
    <Card padding="l" radius="l">
        {@render mainContentView()}
    </Card>
{/if}

{#snippet mainContentView()}
    <Layout.Stack direction="column" gap="xxl">
        <Layout.Stack gap="none" direction="column" alignItems="center" alignContent="center">
            <Typography.Title>Create your first database</Typography.Title>

            <Typography.Text variant="l-400"
                >Store, organize, and manage your app data</Typography.Text>
        </Layout.Stack>

        <Layout.Grid columns={4} columnsS={2} columnsXS={1} gap="xl">
            {#each databaseTypes as db}
                {@render databaseTypeCard({
                    type: db.type,
                    title: db.title,
                    subtitle: db.subtitle,
                    image: images[db.type]
                })}
            {/each}
        </Layout.Grid>
    </Layout.Stack>
{/snippet}

{#snippet databaseTypeCard({ type, title, subtitle, image = undefined })}
    <Card
        isButton
        radius="s"
        padding="none"
        {disabled}
        on:click={() => onDatabaseTypeSelected?.(type)}>
        <Layout.Stack gap="none" direction="column">
            <img src={image} class="database-image adaptive-height" alt="database type artwork" />

            <Divider />

            <Layout.Stack
                gap="xxs"
                direction="column"
                justifyContent="space-between"
                style="padding: var(--gap-xl); flex: 1;">
                <Layout.Stack direction="column" gap="xxs">
                    <Layout.Stack
                        inline
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between">
                        <Typography.Title size="s">{title}</Typography.Title>

                        <Icon size="m" icon={IconArrowRight} color="--fgcolor-neutral-tertiary" />
                    </Layout.Stack>

                    <Typography.Text variant="l-400">{subtitle}</Typography.Text>
                </Layout.Stack>
            </Layout.Stack>
        </Layout.Stack>
    </Card>
{/snippet}

<style lang="scss">
    .database-image {
        border-radius: var(--border-radius-s) 0 0 var(--border-radius-s);

        &.adaptive-height {
            max-height: 236px;
            object-fit: cover;
            object-position: center 5%;
            border-radius: var(--border-radius-s) var(--border-radius-s) 0 0;
        }

        @media (max-width: 768px) {
            max-height: 236px;
            object-fit: cover;
            object-position: center 10%;
            border-radius: var(--border-radius-s) var(--border-radius-s) 0 0;
        }

        @media (min-width: 768px) and (max-width: 1023px) {
            max-height: 236px;
            object-fit: cover;
            border-radius: var(--border-radius-s) var(--border-radius-s) 0 0;
        }
    }
</style>
