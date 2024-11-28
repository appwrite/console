<script lang="ts">
    import Card from '$lib/components/card.svelte';
    import type { Models } from '@appwrite.io/console';
    import { Badge, Layout, Typography } from '@appwrite.io/pink-svelte';

    export let domain: Models.ProxyRule;
</script>

<Card radius="s" padding="s" isTile>
    <Layout.Stack gap="s">
        <Layout.Stack gap="s" direction="row" alignItems="center">
            <Typography.Text variant="l-500">{domain.domain}</Typography.Text>
            <Badge variant="secondary" type="warning" content="Pending verification" />
        </Layout.Stack>
        <p>
            Add the following record with your DNS provider. Note that changes may take up to 48
            hours to take effect. You can periodically check the verification status in your domain
            settings.
        </p>
    </Layout.Stack>
    <slot />
</Card>
