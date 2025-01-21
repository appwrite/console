<script lang="ts">
    import { CardGrid, Trim } from '$lib/components';
    import Heading from '$lib/components/heading.svelte';
    import Link from '$lib/elements/link.svelte';
    import { toLocaleDate } from '$lib/helpers/date';
    import { protocol } from '$routes/(console)/store';
    import type { Models } from '@appwrite.io/console';
    import { IconExternalLink } from '@appwrite.io/pink-icons-svelte';
    import { Icon, Layout, Typography } from '@appwrite.io/pink-svelte';

    export let domain: Models.ProxyRule;
</script>

<CardGrid>
    <Heading tag="h6" size="7">SSL certificates</Heading>
    <p>
        SSL certificates secure your site with HTTPS, protecting data and boosting trust. Appwrite
        renews your SSL certificates automatically.
    </p>
    <svelte:fragment slot="aside">
        <Layout.Stack gap="xl">
            <Layout.Stack gap="xl" direction="row">
                <Layout.Stack gap="xs">
                    <Typography.Text variant="m-400" color="--color-fgcolor-neutral-tertiary">
                        Domain
                    </Typography.Text>
                    <Link external href={`${$protocol}${domain.domain}`} variant="muted">
                        <Layout.Stack gap="xxs" direction="row" alignItems="center">
                            <Trim alternativeTrim>
                                {domain.domain}
                            </Trim>
                            <Icon icon={IconExternalLink} size="s" />
                        </Layout.Stack>
                    </Link>
                </Layout.Stack>
                <Layout.Stack gap="xs">
                    <Typography.Text variant="m-400" color="--color-fgcolor-neutral-tertiary">
                        Registar
                    </Typography.Text>
                    MISSING BACKEND DATA
                </Layout.Stack>
            </Layout.Stack>
            <Layout.Stack gap="xl" direction="row">
                <Layout.Stack gap="xs">
                    <Typography.Text variant="m-400" color="--color-fgcolor-neutral-tertiary">
                        Expiry date
                    </Typography.Text>

                    {toLocaleDate(domain.renewAt)}
                </Layout.Stack>
                <Layout.Stack gap="xs">
                    <Typography.Text variant="m-400" color="--color-fgcolor-neutral-tertiary">
                        Activity
                    </Typography.Text>
                    {toLocaleDate(domain.$updatedAt)}
                </Layout.Stack>
            </Layout.Stack>
        </Layout.Stack>
    </svelte:fragment>
</CardGrid>
