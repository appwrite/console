<script lang="ts">
    import { Link } from '$lib/elements';
    import { IconInfo } from '@appwrite.io/pink-icons-svelte';
    import { getSubdomain } from '$lib/helpers/tlds';
    import {
        Badge,
        Layout,
        Typography,
        Table,
        Icon,
        InteractiveText
    } from '@appwrite.io/pink-svelte';
    import { regionalConsoleVariables } from '$routes/(console)/project-[region]-[project]/store';

    let {
        domain,
        verified = undefined,
        ruleStatus = undefined
    }: {
        domain: string;
        verified?: boolean | undefined;
        ruleStatus?: string | undefined;
    } = $props();

    const subdomain = $derived(getSubdomain(domain));

    const caaText = $derived(
        $regionalConsoleVariables._APP_DOMAIN_TARGET_CAA?.includes(' ')
            ? $regionalConsoleVariables._APP_DOMAIN_TARGET_CAA
            : `0 issue "${$regionalConsoleVariables._APP_DOMAIN_TARGET_CAA}"`
    );
</script>

<Layout.Stack gap="xl">
    <Layout.Stack gap="s">
        <Layout.Stack gap="s" direction="row" alignItems="center">
            <Typography.Text variant="l-500" color="--fgcolor-neutral-primary">
                {domain}
            </Typography.Text>
            {#if ruleStatus === 'created'}
                <Badge variant="secondary" type="error" size="xs" content="Verification failed" />
            {:else if ruleStatus === 'verifying'}
                <Badge variant="secondary" size="xs" content="Generating certificate" />
            {:else if ruleStatus === 'unverified'}
                <Badge
                    variant="secondary"
                    type="error"
                    size="xs"
                    content="Certificate generation failed" />
            {:else if verified === true}
                <Badge variant="secondary" type="success" size="xs" content="Verified" />
            {/if}
        </Layout.Stack>
        <Typography.Text variant="m-400">
            Add the following record on your DNS provider. Note that DNS changes may take up to 48
            hours to propagate fully.
        </Typography.Text>
    </Layout.Stack>

    <Table.Root columns={3} let:root>
        <svelte:fragment slot="header" let:root>
            <Table.Header.Cell {root}>Type</Table.Header.Cell>
            <Table.Header.Cell {root}>Name</Table.Header.Cell>
            <Table.Header.Cell {root}>Value</Table.Header.Cell>
        </svelte:fragment>
        <Table.Row.Base {root}>
            <Table.Cell {root}>CNAME</Table.Cell>
            <Table.Cell {root}>{subdomain || '@'}</Table.Cell>
            <Table.Cell {root}>
                <InteractiveText
                    variant="copy"
                    isVisible
                    text={$regionalConsoleVariables._APP_DOMAIN_TARGET_CNAME} />
            </Table.Cell>
        </Table.Row.Base>
        {#if $regionalConsoleVariables._APP_DOMAIN_TARGET_CAA}
            <Table.Row.Base {root}>
                <Table.Cell {root}>
                    <Layout.Stack gap="s" direction="row" alignItems="center">
                        <span>CAA</span>
                        <Badge variant="secondary" size="xs" content="Recommended" />
                    </Layout.Stack>
                </Table.Cell>
                <Table.Cell {root}>@</Table.Cell>
                <Table.Cell {root}>
                    <InteractiveText variant="copy" isVisible text={caaText} />
                </Table.Cell>
            </Table.Row.Base>
        {/if}
    </Table.Root>
    <Layout.Stack gap="s" direction="row" alignItems="center">
        <Icon icon={IconInfo} size="s" color="--fgcolor-neutral-secondary" />
        <Typography.Text variant="m-400" color="--fgcolor-neutral-secondary">
            A list of all domain providers and their DNS setting is available <Link
                variant="muted"
                external
                href="https://appwrite.io/docs/advanced/platform/custom-domains">here</Link
            >.
        </Typography.Text>
    </Layout.Stack>
</Layout.Stack>
