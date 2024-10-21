<script lang="ts">
    import { Layout, Avatar, Typography, Card } from '@appwrite.io/pink-svelte';
    import { base } from '$app/paths';
    import { app } from '$lib/stores/app';
    import { timeFromNow } from '$lib/helpers/date';
    import { page } from '$app/stores';

    export let site: {
        preview: string;
        name: string;
        framework: string;
        status: string;
        domain: string;
        url: string;
        $id: string;
        $createdAt: string;
        $updatedAt: string;
    } = null;
</script>

{#if site}
    <div class="card-image">
        <Card.Link
            variant="primary"
            padding="x-small"
            href={`${base}/project-${$page.params.project}/sites/sites-${site.$id}`}>
            <Layout.Stack direction="column" gap="s">
                <div class="image-container">
                    <div class="framework">
                        <Avatar
                            size="small"
                            src={`${base}/icons/${$app.themeInUse}/color/${site.framework}.svg`}
                            alt={site.framework} />
                    </div>
                    <img src={site.preview} alt={site.name} />
                </div>
                <Layout.Stack direction="column" gap="none">
                    <Layout.Stack
                        direction="row"
                        justifyContent="space-between"
                        alignContent="flex-start"
                        alignItems="center">
                        <Typography.Text
                            style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"
                            variant="m-500">
                            {site.name}
                        </Typography.Text>

                        <slot />
                    </Layout.Stack>
                    <Typography.Caption variant="400">
                        Deployed {timeFromNow(site.$updatedAt)}
                    </Typography.Caption>
                </Layout.Stack>
            </Layout.Stack>
        </Card.Link>
    </div>
{/if}

<style lang="scss">
    .card-image {
        min-width: 237.5px;
        // max-width: 20.5rem;
        width: 100%;
        display: flex;

        .image-container {
            position: relative;
            width: 100%;
            .framework {
                position: absolute;
                bottom: 0.5rem;
                left: 0.5rem;
                z-index: 1;
            }
            img {
                width: 100%;
                height: 146px;
                object-fit: cover;
                object-position: top;
                border-radius: 0.5rem;
            }
        }
    }
</style>
