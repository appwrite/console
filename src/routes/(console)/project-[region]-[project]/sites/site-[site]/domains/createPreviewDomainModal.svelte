<script lang="ts">
    import { Modal } from '$lib/components';
    import { Button, InputText } from '$lib/elements/forms';
    import { sdk } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import { invalidate } from '$app/navigation';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Dependencies } from '$lib/constants';
    import { page } from '$app/state';
    import { Layout, Status, Typography } from '@appwrite.io/pink-svelte';
    import { ConsoleResourceType, ID } from '@appwrite.io/console';
    import { debounce } from '$lib/helpers/debounce';
    import { regionalConsoleVariables } from '$routes/(console)/project-[region]-[project]/store';

    export let show = false;

    let baseDomain = ID.unique();
    let domain = baseDomain;
    let domainStatus: 'complete' | 'failed' | 'pending' = 'complete';

    let error: string = null;
    async function onSubmit() {
        try {
            await sdk
                .forProject(page.params.region, page.params.project)
                .proxy.createSiteRule(
                    `${domain}.${$regionalConsoleVariables._APP_DOMAIN_SITES}`,
                    page.params.site
                );

            await invalidate(Dependencies.SITES_DOMAINS);
            show = false;
            addNotification({
                type: 'success',
                message: 'Preview domain has been added'
            });
            trackEvent(Submit.DomainCreate);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.DomainCreate);
        }
    }

    function setDomainLabel(status: typeof domainStatus) {
        switch (status) {
            case 'complete':
                return 'Domain is available';
            case 'failed':
                return 'Domain is not available';
            case 'pending':
                return 'Checking domain availability';
        }
    }

    const checkDomain = debounce(async (value: string) => {
        if (!value) {
            domainStatus = 'failed';
            return;
        }
        try {
            await sdk.forConsole.console.getResource(
                `${value}.${$regionalConsoleVariables._APP_DOMAIN_SITES}`,
                ConsoleResourceType.Rules
            );
            domainStatus = 'complete';
            baseDomain = domain;
        } catch {
            domainStatus = 'failed';
        } finally {
            baseDomain = domain;
        }
    }, 500);

    $: if (domain !== baseDomain) {
        domainStatus = 'pending';
        checkDomain(domain);
    }

    $: if (!show) {
        error = null;
    }
</script>

<Modal title="Add preview domain" bind:show {onSubmit} bind:error>
    <span slot="description">
        Get an auto-generated domain to quickly access your project. You can customize its prefix.
    </span>

    <Layout.Stack>
        <Layout.Stack gap="s">
            <InputText id="domain" placeholder="my-domain" bind:value={domain}>
                <svelte:fragment slot="end">
                    <Typography.Text variant="m-400" color="--fgcolor-neutral-tertiary">
                        .{$regionalConsoleVariables._APP_DOMAIN_SITES}
                    </Typography.Text>
                </svelte:fragment>
            </InputText>
            <Status status={domainStatus} label={setDomainLabel(domainStatus)}></Status>
        </Layout.Stack>
    </Layout.Stack>

    <svelte:fragment slot="footer">
        <Button text on:click={() => (show = false)}>Cancel</Button>
        <Button submit>Add</Button>
    </svelte:fragment>
</Modal>
