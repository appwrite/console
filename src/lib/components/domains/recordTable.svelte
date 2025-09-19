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

    export let domain: string;
    export let verified: boolean | undefined = undefined;
    export let variant: 'cname' | 'a' | 'aaaa';
    export let service: 'sites' | 'general' = 'general';
    export let ruleStatus: string | undefined = undefined;
    export let onNavigateToNameservers: () => void = () => {};
    export let onNavigateToA: () => void = () => {};
    export let onNavigateToAAAA: () => void = () => {};

    let subdomain = domain?.split('.')?.slice(0, -2)?.join('.');

    const aTabVisible =
        !isCloud &&
        !!$regionalConsoleVariables._APP_DOMAIN_TARGET_A &&
        $regionalConsoleVariables._APP_DOMAIN_TARGET_A !== '127.0.0.1';
    const aaaaTabVisible =
        !isCloud &&
        !!$regionalConsoleVariables._APP_DOMAIN_TARGET_AAAA &&
        $regionalConsoleVariables._APP_DOMAIN_TARGET_AAAA !== '::1';

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
                    <InteractiveText
                        variant="copy"
                        isVisible
                        text={$regionalConsoleVariables._APP_DOMAIN_TARGET_CAA.includes(' ')
                            ? $regionalConsoleVariables._APP_DOMAIN_TARGET_CAA
                            : `0 issue "${$regionalConsoleVariables._APP_DOMAIN_TARGET_CAA}"`} />
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
