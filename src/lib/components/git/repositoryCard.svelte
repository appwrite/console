<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import Link from '$lib/elements/link.svelte';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import type { Models } from '@appwrite.io/console';
    import { IconGithub } from '@appwrite.io/pink-icons-svelte';
    import { Card, Icon, Layout, Typography } from '@appwrite.io/pink-svelte';
    import { createEventDispatcher } from 'svelte';

    export let repository: Models.ProviderRepository;

    const dispatch = createEventDispatcher();
</script>

<Card.Base padding="xs" radius="s" variant="secondary">
    <Layout.Stack
        direction="row"
        alignItems="flex-start"
        justifyContent="space-between"
        wrap="wrap"
        gap="s">
        <Layout.Stack
            direction="row"
            alignItems="flex-start"
            gap="s"
            style="min-width: 0; flex: 1 1 16rem;">
            <Icon icon={IconGithub} color="--fgcolor-neutral-primary" />
            <Layout.Stack gap="xxxs" style="min-width: 0; flex: 1 1 auto;">
                <Typography.Text variant="m-400" color="--fgcolor-neutral-primary">
                    <span class="repository-copy">{repository.name}</span>
                </Typography.Text>
                <Layout.Stack direction="row" alignItems="center" gap="xs" wrap="wrap">
                    <Typography.Caption variant="400" color="--fgcolor-neutral-tertiary">
                        <span class="repository-copy">
                            Last updated: {toLocaleDateTime(repository.pushedAt)}
                        </span>
                    </Typography.Caption>
                    <Typography.Caption variant="400" color="--fgcolor-neutral-tertiary">
                        •
                    </Typography.Caption>
                    <Link
                        size="s"
                        variant="muted"
                        external
                        href={`https://github.com/${repository.organization}`}>
                        <span class="repository-copy">{repository.organization}</span>
                    </Link>
                </Layout.Stack>
            </Layout.Stack>
        </Layout.Stack>
        <Button secondary on:click={() => dispatch('disconnect')}>Disconnect</Button>
    </Layout.Stack>
</Card.Base>

<style>
    .repository-copy {
        display: inline-block;
        min-width: 0;
        overflow-wrap: anywhere;
        max-width: 100%;
    }
</style>
