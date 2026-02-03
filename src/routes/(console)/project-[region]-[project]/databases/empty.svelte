<script lang="ts">
    import { app } from '$lib/stores/app';
    import { Card } from '$lib/components';

    import { IconArrowRight } from '@appwrite.io/pink-icons-svelte';
    import { Layout, Typography, Icon, Divider } from '@appwrite.io/pink-svelte';

    /*import MongoDB from './(assets)/mongo-db.svg';
    import MongoDBDark from './(assets)/dark/mongo-db.svg';*/

    import TablesDB from './(assets)/tables-db.svg';
    import TablesDBDark from './(assets)/dark/tables-db.svg';

    import DocumentsDB from './(assets)/documents-db.svg';
    import DocumentsDBDark from './(assets)/dark/documents-db.svg';

    import { isSmallViewport, isViewPortWidthInRange } from '$lib/stores/viewport';
    import type { DatabaseType } from '$database/(entity)';

    const {
        disabled,
        onDatabaseTypeSelected
    }: {
        disabled?: boolean;
        onDatabaseTypeSelected?: (type: DatabaseType) => Promise<void> | void;
    } = $props();

    const isDark = $derived($app.themeInUse === 'dark');
    /*const mongoDbImage = $derived(isDark ? MongoDBDark : MongoDB);*/
    const tablesDbImage = $derived(isDark ? TablesDBDark : TablesDB);
    const documentsDbImage = $derived(isDark ? DocumentsDBDark : DocumentsDB);

    const inRangeStore = isViewPortWidthInRange(1024, 1280);
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

        <Layout.Grid columns={2} columnsS={1} gap="xl">
            <!-- legacy, tablesDB -->
            {@render databaseTypeCard({
                type: 'tablesdb',
                title: 'TablesDB',
                subtitle:
                    'Structure your data in rows and columns. Best for relational data and advanced querying.',
                image: tablesDbImage
            })}

            <!-- documentsDB -->
            {@render databaseTypeCard({
                type: 'documentsdb',
                title: 'DocumentsDB',
                subtitle:
                    'Store flexible data without a fixed schema. Best for unstructured data and simple querying.',
                image: documentsDbImage
            })}
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
        {@const direction = $isSmallViewport || $inRangeStore ? 'column' : 'row'}
        <Layout.Stack gap="none" {direction}>
            <img
                src={image}
                class="database-image"
                class:adaptive-height={$inRangeStore}
                alt="database type artwork" />

            {#if $isSmallViewport || $inRangeStore}
                <Divider />
            {/if}

            <Layout.Stack
                gap="xxs"
                direction="column"
                justifyContent="space-between"
                style="padding: var(--gap-xl); flex: 1; {!$isSmallViewport && !$inRangeStore
                    ? 'border-inline-start: 1px solid var(--border-neutral);'
                    : ''}">
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
