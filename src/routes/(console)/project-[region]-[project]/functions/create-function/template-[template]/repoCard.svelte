<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { repository } from '$lib/stores/vcs';
    import { IconGithub } from '@appwrite.io/pink-icons-svelte';

    import { Card, Icon, Layout, Typography } from '@appwrite.io/pink-svelte';

    export let showConfig: boolean;
</script>

<Card.Base padding="s" radius="s">
    <Layout.Stack direction="row" justifyContent="space-between" alignItems="center" gap="xs">
        <Layout.Stack direction="row" alignItems="center" gap="s">
            <Icon size="s" icon={IconGithub} />
            <Typography.Text variant="m-400" color="--fgcolor-neutral-primary">
                {$repository.organization}/{$repository.name}
            </Typography.Text>
        </Layout.Stack>
        <Button
            size="s"
            secondary
            on:click={() => {
                showConfig = false;
            }}>
            Update
        </Button>
    </Layout.Stack>
</Card.Base>
