<script lang="ts">
    import { Link } from '$lib/elements';
    import {
        Badge,
        Layout,
        Typography,
        Table,
        InteractiveText,
        Alert
    } from '@appwrite.io/pink-svelte';
    import { regionalConsoleVariables } from '$routes/(console)/project-[region]-[project]/store';
    import { isCloud } from '$lib/system';
    import { getSubdomain } from '$lib/helpers/tlds';

    let {
        domain,
        verified = undefined,
        variant,
        service = 'general',
        ruleStatus = undefined,
        onNavigateToNameservers = () => {},
        onNavigateToA = () => {},
        onNavigateToAAAA = () => {}
    }: {
        domain: string;
        verified?: boolean | undefined;
        variant: 'cname' | 'a' | 'aaaa';
        service?: 'sites' | 'general';
        ruleStatus?: string | undefined;
        onNavigateToNameservers?: () => void;
        onNavigateToA?: () => void;
        onNavigateToAAAA?: () => void;
    } = $props();

    const subdomain = $derived(getSubdomain(domain));

    const aTabVisible = $derived(
        !isCloud &&
            Boolean($regionalConsoleVariables._APP_DOMAIN_TARGET_A) &&
            $regionalConsoleVariables._APP_DOMAIN_TARGET_A !== '127.0.0.1'
    );
    const aaaaTabVisible = $derived(
        !isCloud &&
            Boolean($regionalConsoleVariables._APP_DOMAIN_TARGET_AAAA) &&
            $regionalConsoleVariables._APP_DOMAIN_TARGET_AAAA !== '::1'
    );

    const caaText = $derived(
        $regionalConsoleVariables._APP_DOMAIN_TARGET_CAA?.includes(' ')
            ? $regionalConsoleVariables._APP_DOMAIN_TARGET_CAA
            : `0 issue "${$regionalConsoleVariables._APP_DOMAIN_TARGET_CAA}"`
    );

    function setTarget() {
        switch (variant) {
            case 'cname':
                return service === 'general'
                    ? $regionalConsoleVariables._APP_DOMAIN_TARGET_CNAME
                    : $regionalConsoleVariables._APP_DOMAIN_SITES;
            case 'a':
                return $regionalConsoleVariables._APP_DOMAIN_TARGET_A;
            case 'aaaa':
                return $regionalConsoleVariables._APP_DOMAIN_TARGET_AAAA;
        }
    }
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
            <Table.Cell {root}>{variant.toUpperCase()}</Table.Cell>
            <Table.Cell {root}>{subdomain || '@'}</Table.Cell>
            <Table.Cell {root}>
                <InteractiveText variant="copy" isVisible text={setTarget()} />
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
        {#if variant === 'cname' && !subdomain}
            {#if isCloud}
                <Alert.Inline>
                    Since <Badge variant="secondary" size="s" content={domain} /> is an apex domain,
                    CNAME record is only supported by certain providers. If yours doesn't, please verify
                    using
                    <Link variant="muted" on:click={onNavigateToNameservers}>nameservers</Link> instead.
                </Alert.Inline>
            {:else if aTabVisible || aaaaTabVisible}
                <Alert.Inline>
                    Since <Badge variant="secondary" size="s" content={domain} /> is an apex domain,
                    CNAME record is only supported by certain providers. If yours doesn't, please verify
                    using
                    {#if aTabVisible}
                        <Link variant="muted" on:click={onNavigateToA}>A record</Link>
                        {#if aaaaTabVisible}
                            or <Link variant="muted" on:click={onNavigateToAAAA}>AAAA record</Link
                            >{/if}
                    {:else if aaaaTabVisible}
                        <Link variant="muted" on:click={onNavigateToAAAA}>AAAA record</Link>
                    {/if} instead.
                </Alert.Inline>
            {/if}
        {:else}
            <Typography.Text variant="m-400" color="--fgcolor-neutral-secondary">
                A list of all domain providers and their DNS setting is available <Link
                    variant="muted"
                    external
                    href="https://appwrite.io/docs/advanced/platform/custom-domains">here</Link
                >.
            </Typography.Text>
        {/if}
    </Layout.Stack>
</Layout.Stack>
