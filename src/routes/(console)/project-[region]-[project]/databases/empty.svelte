<script lang="ts">
    import { app } from '$lib/stores/app';
    import { Card } from '$lib/components';

    import { IconArrowRight } from '@appwrite.io/pink-icons-svelte';
    import { Layout, Typography, Icon, Divider } from '@appwrite.io/pink-svelte';

    import MongoDB from './(assets)/mongo-db.svg';
    import MongoDBDark from './(assets)/dark/mongo-db.svg';

    import TablesDB from './(assets)/tables-db.svg';
    import TablesDBDark from './(assets)/dark/tables-db.svg';

    import DocumentsDB from './(assets)/documents-db.svg';
    import DocumentsDBDark from './(assets)/dark/documents-db.svg';

    import PrismaPostgres from './(assets)/prisma-postgres.svg';
    import PrismaPostgresDark from './(assets)/dark/prisma-postgres.svg';

    import DedicatedDB from './(assets)/dedicated-db.svg';
    import DedicatedDBDark from './(assets)/dark/dedicated-db.svg';

    import { isSmallViewport } from '$lib/stores/viewport';
    import type { DatabaseType } from '$database/(entity)';

    const {
        disabled,
        onDatabaseTypeSelected
    }: {
        disabled?: boolean;
        onDatabaseTypeSelected?: (type: DatabaseType) => Promise<void> | void;
    } = $props();

    const isDark = $derived($app.themeInUse === 'dark');
    const mongoDbImage = $derived(isDark ? MongoDBDark : MongoDB);
    const tablesDbImage = $derived(isDark ? TablesDBDark : TablesDB);
    const documentsDbImage = $derived(isDark ? DocumentsDBDark : DocumentsDB);
    const prismaPostgresImage = $derived(isDark ? PrismaPostgresDark : PrismaPostgres);
    const dedicatedDbImage = $derived(isDark ? DedicatedDBDark : DedicatedDB);
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
            image: tablesDbImage
        })}

        <!-- documentsDB -->
        {@render databaseTypeCard({
            type: 'documentsdb',
            title: 'DocumentsDB',
            subtitle:
                'Store flexible data without a fixed schema. Best for unstructured data and simple querying.',
            image: documentsDbImage,
            footerType: 'mongodb'
        })}

        <!-- Prisma Postgres -->
        {@render databaseTypeCard({
            type: 'prisma',
            title: 'Prisma Postgres',
            subtitle:
                'Managed PostgreSQL with direct connections. Best for high-performance SQL workloads.',
            image: prismaPostgresImage,
            footerType: 'prisma'
        })}

        <!-- Dedicated Database -->
        {@render databaseTypeCard({
            type: 'dedicated',
            title: 'DedicatedDB',
            subtitle:
                'Always-on dedicated database instances with high availability. Best for production workloads.',
            image: dedicatedDbImage,
            footerType: 'appwrite'
        })}
    </Layout.Grid>
{/snippet}

{#snippet databaseTypeCard({ type, title, subtitle, image = undefined, footerType = undefined })}
    <Card
        isButton
        radius="s"
        padding="none"
        {disabled}
        on:click={() => onDatabaseTypeSelected?.(type)}>
        {@const direction = $isSmallViewport ? 'column' : 'row'}
        <Layout.Stack gap="none" {direction}>
            <img class="database-image" src={image} alt="database type artwork" />

            {#if $isSmallViewport}
                <Divider />
            {/if}

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
                    {#if footerType === 'mongodb'}
                        <Typography.Text>Powered by</Typography.Text>
                        <img
                            height="20px"
                            width="auto"
                            src={mongoDbImage}
                            alt="mongo-db artwork"
                            style:padding-block-end="2px" />
                    {:else if footerType === 'prisma'}
                        <Typography.Text>Powered by</Typography.Text>
                        <img
                            height="20px"
                            width="auto"
                            src={prismaPostgresImage}
                            alt="prisma artwork"
                            style:padding-block-end="2px" />
                    {:else if footerType === 'appwrite'}
                        <Typography.Text>Powered by Appwrite</Typography.Text>
                    {/if}
                </Layout.Stack>
            </Layout.Stack>
        </Layout.Stack>
    </Card>
{/snippet}

<style lang="scss">
    .database-image {
        border-radius: var(--border-radius-s) 0 0 var(--border-radius-s);

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
