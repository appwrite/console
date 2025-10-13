<script lang="ts">
    import { app } from '$lib/stores/app';
    import { Card } from '$lib/components';

    import { IconArrowRight } from '@appwrite.io/pink-icons-svelte';
    import { Layout, Typography, Icon } from '@appwrite.io/pink-svelte';

    // TODO: the images have bottom rounded borders.
    import MongoDB from './(assets)/mongo-db.svg';
    import MongoDBDark from './(assets)/dark/mongo-db.svg';

    import TablesDB from './(assets)/tables-db.svg';
    import DocumentsDB from './(assets)/documents-db.svg';
    import type { DatabaseType } from '$database/(entity)';
    import { isSmallViewport, isTabletViewport } from '$lib/stores/viewport';

    const {
        disabled,
        onDatabaseTypeSelected
    }: {
        disabled?: boolean;
        onDatabaseTypeSelected?: (type: DatabaseType) => Promise<void> | void;
    } = $props();

    const isDark = $derived($app.themeInUse === 'dark');
    const mongoDbImage = $derived(isDark ? MongoDBDark : MongoDB);
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
    </Layout.Stack>

    <Layout.Grid columns={2} columnsS={1}>
        <!-- legacy, tablesDB -->
        {@render databaseTypeCard({
            type: 'tablesdb',
            title: 'TablesDB',
            subtitle:
                'Structure your data in rows and columns. Best for relational data and advanced querying.',
            image: TablesDB
        })}

        <!-- documentsDB -->
        {@render databaseTypeCard({
            type: 'documentsdb',
            title: 'DocumentsDB',
            subtitle:
                'Store flexible data without a fixed schema. Best for unstructured data and simple querying.',
            image: DocumentsDB,
            footer: true
        })}
    </Layout.Grid>
{/snippet}

{#snippet databaseTypeCard({ type, title, subtitle, image = undefined, footer = false })}
    <Card
        isButton
        radius="s"
        padding="none"
        {disabled}
        on:click={() => onDatabaseTypeSelected?.(type)}>
        <Layout.Stack gap="none" direction={$isTabletViewport ? 'column' : 'row'}>
            <img class="database-image" src={image} alt="database type artwork" />

            <Layout.Stack
                gap="xxs"
                direction="column"
                justifyContent="space-between"
                style="margin-block-start: 20px; padding-inline: 20px; flex: 1;">
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

                <Layout.Stack
                    inline
                    gap="xxs"
                    direction="row"
                    alignContent="center"
                    style="margin-block-end: 20px;">
                    {#if footer}
                        <Typography.Text>Powered by</Typography.Text>

                        <img
                            height="20px"
                            width="auto"
                            src={mongoDbImage}
                            alt="mongo-db artwork"
                            style:padding-block-end="2px" />
                    {/if}
                </Layout.Stack>
            </Layout.Stack>
        </Layout.Stack>
    </Card>
{/snippet}

<style lang="scss">
    @media (max-width: 768px) {
        .database-image {
            object-fit: cover;
            background: white; /* because images have rounded borders atm */
            object-position: center 20%;
            border-radius: var(--border-radius-s) var(--border-radius-s) 0 0;
        }
    }
</style>
