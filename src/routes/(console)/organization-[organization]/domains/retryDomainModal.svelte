<script lang="ts">
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { sdk } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import { invalidate } from '$app/navigation';
    import type { Domain } from '$lib/sdk/domains';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Dependencies } from '$lib/constants';
    import { Input, InteractiveText, Layout, Table, Typography } from '@appwrite.io/pink-svelte';
    import { Link } from '$lib/elements';
    import { consoleVariables } from '$routes/(console)/store';

    export let show = false;
    export let selectedDomain: Domain;
    let nameservers = $consoleVariables?._APP_DOMAINS_NAMESERVERS.split(',') ?? [
        'ns1.appwrite.io',
        'ns2.appwrite.io'
    ];

    let error = null;
    async function retryDomain() {
        try {
            const domain = await sdk.forConsole.domains.updateNameservers(selectedDomain.$id);
            show = false;
            if (domain.nameservers === 'Appwrite') {
                addNotification({
                    type: 'error',
                    message: `${selectedDomain.domain} has been verified`
                });
            } else {
                addNotification({
                    type: 'error',
                    message: `Domain verification failed. Please check your domain settings or try again later`
                });
            }
            await invalidate(Dependencies.DOMAINS);
            trackEvent(Submit.DomainUpdateVerification);
        } catch (e) {
            error = e;
            trackError(e, Submit.DomainUpdateVerification);
        }
    }

    $: if (!show) {
        error = null;
    }
</script>

<Modal title="Retry verification" bind:show onSubmit={retryDomain} bind:error>
    <Layout.Stack gap="s">
        <Layout.Stack gap="s" direction="row" alignItems="center">
            <Typography.Text variant="l-500" color="--fgcolor-neutral-primary"
                >{selectedDomain.domain}</Typography.Text>
        </Layout.Stack>
        <Typography.Text variant="m-400">
            Add the following nameservers on your DNS provider. Note that DNS changes may take time
            to propagate fully.
        </Typography.Text>
    </Layout.Stack>

    <Table.Root let:root columns={2}>
        <svelte:fragment slot="header" let:root>
            <Table.Header.Cell {root}>Type</Table.Header.Cell>
            <Table.Header.Cell {root}>Value</Table.Header.Cell>
        </svelte:fragment>
        {#each nameservers as nameserver}
            <Table.Row.Base {root}>
                <Table.Cell {root} column="ns">NS</Table.Cell>
                <Table.Cell {root} column="action">
                    <InteractiveText variant="copy" isVisible text={nameserver} />
                </Table.Cell>
            </Table.Row.Base>
        {/each}
    </Table.Root>
    <Input.Helper state="default">
        A list of all domain providers and their DNS setting is available <Link
            variant="muted"
            external
            href="https://appwrite.io/docs/advanced/platform/custom-domains">here</Link
        >.
    </Input.Helper>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (show = false)}>Cancel</Button>
        <Button submit>Retry</Button>
    </svelte:fragment>
</Modal>
