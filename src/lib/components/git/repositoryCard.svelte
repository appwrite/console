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
    <Layout.Stack direction="row" gap="s">
        <Layout.Stack direction="row" gap="s">
            <Icon icon={IconGithub} color="--fgcolor-neutral-primary" />
            <Layout.Stack gap="xxxs">
                <Typography.Text variant="m-400" color="--fgcolor-neutral-primary">
                    {repository.name}
                </Typography.Text>
                <Layout.Stack direction="row" gap="s" alignItems="center">
                    <Typography.Caption variant="400" color="--fgcolor-neutral-tertiary">
                        Last updated: {toLocaleDateTime(repository.pushedAt)}
                    </Typography.Caption>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="2"
                        height="3"
                        viewBox="0 0 2 3"
                        fill="none">
                        <circle cx="1" cy="1.5" r="1" fill="currentColor" />
                    </svg>
                    <Link
                        size="s"
                        variant="muted"
                        external
                        href={`https://github.com/${repository.organization}`}
                        >{repository.organization}</Link>
                </Layout.Stack>
            </Layout.Stack>
        </Layout.Stack>
        <Button secondary on:click={() => dispatch('disconnect')}>Disconnect</Button>
    </Layout.Stack>
</Card.Base>
