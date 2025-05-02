<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Button } from '$lib/elements/forms';
    import type { Models } from '@appwrite.io/console';
    import { IconGithub } from '@appwrite.io/pink-icons-svelte';
    import { Card, Icon, Layout, Typography } from '@appwrite.io/pink-svelte';

    export let repository: Models.ProviderRepository;
</script>

<Card.Base radius="s" padding="s">
    <Layout.Stack direction="row" justifyContent="space-between" alignItems="center" gap="xs">
        <Layout.Stack direction="row" alignItems="center" gap="xs">
            <Icon icon={IconGithub} color="--fgcolor-neutral-primary" />
            <Typography.Text variation="m-500" color="--fgcolor-neutral-primary">
                {repository?.organization}/{repository?.name}
            </Typography.Text>
        </Layout.Stack>
        <Button
            secondary
            href={`${base}/project-${page.params.region}-${page.params.project}/functions/create-function`}>
            Change
        </Button>
    </Layout.Stack>
</Card.Base>
