<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Button, Form, InputSelect } from '$lib/elements/forms';
    import { Wizard } from '$lib/layout';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import {
        Fieldset,
        Layout,
        Tooltip,
        Icon,
        Alert,
        Input,
        Divider,
        Typography,
        Badge,
        Card
    } from '@appwrite.io/pink-svelte';
    import { goto, invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { sortBranches } from '$lib/stores/vcs';
    import { organization } from '$lib/stores/organization';
    import { consoleVariables } from '$routes/(console)/store';
    import InputDomain from '$lib/elements/forms/inputDomain.svelte';
    import { IconGlobeAlt, IconInfo } from '@appwrite.io/pink-icons-svelte';
    import { LabelCard } from '$lib/components';
    import { writable } from 'svelte/store';
    import ConnectRepoModal from '../../../(components)/connectRepoModal.svelte';
    import { isCloud } from '$lib/system';
    import { onMount } from 'svelte';
    import { StatusCode } from '@appwrite.io/console';

    const backPage = `${base}/project-${$page.params.project}/sites/site-${$page.params.site}/domains`;

    export let data;

    let formComponent: Form;
    let isSubmitting = writable(false);

    let showConnectRepo = false;
    let behaviour: 'REDIRECT' | 'BRANCH' | 'ACTIVE' = 'ACTIVE';
    let step: 'add' | 'verify' = 'add';
    let domain = '';
    let redirect: string = null;
    let statusCode: number = null;
    let branch = null;

    const redirectOptions = data.domains.rules
        .filter((d) => !d.domain.endsWith($consoleVariables._APP_DOMAIN_SITES))
        .map((domain) => ({
            label: domain.domain,
            value: domain.domain
        }));

    const statusCodeOptions = [
        {
            label: '301 Moved permanently',
            value: 301
        },
        {
            label: '302 Found',
            value: 302
        },
        {
            label: '303 See other',
            value: 303
        },
        {
            label: '307 Temporary redirect',
            value: 307
        },
        {
            label: '308 Permanent redirect',
            value: 308
        }
    ];

    onMount(() => {
        if (
            $page.url.searchParams.has('connectRepo') &&
            $page.url.searchParams.get('connectRepo') === 'true'
        ) {
            showConnectRepo = true;
        }
    });

    async function addDomain() {
        const isPreviewDomain = domain.endsWith($consoleVariables._APP_DOMAIN_SITES);
        const isNewDomain = data.domains.rules.findIndex((rule) => rule.domain === domain) === -1;
        const isSubDomain = domain.split('.').length >= 2;
        try {
            if (behaviour === 'CREATE') {
                if (isCloud && !isPreviewDomain) {
                    //Redirect if subdomain so user can choose how to proceed
                    if (isSubDomain) {
                        goto(
                            `${base}/project-${$page.params.project}/sites/site-${$page.params.site}/domains/add-domain/verify?domain=${domain}`
                        );
                    }
                    //Create domain if it's a new domain
                    else if (isNewDomain) {
                        const domainData = await sdk.forConsole.domains.create(
                            $organization.$id,
                            domain
                        );
                        await sdk.forProject.proxy.createSiteRule(
                            domain,
                            $page.params.site,
                            branch
                        );
                        goto(
                            `${base}/project-${$page.params.project}/sites/site-${$page.params.site}/domains/add-domain/verify-${domainData.$id}}`
                        );
                    }
                }
                //if selfhosted or preview domain create site rule
                else {
                    await sdk.forProject.proxy.createSiteRule(domain, $page.params.site, branch);
                    addNotification({
                        type: 'success',
                        message: 'Domain added successfully'
                    });
                    await goto(backPage);
                    await invalidate(Dependencies.SITES_DOMAINS);
                }
            } else if (behaviour === 'REDIRECT') {
                if (isCloud && !isPreviewDomain) {
                    //Redirect if subdomain so user can choose how to proceed
                    if (isSubDomain) {
                        goto(
                            `${base}/project-${$page.params.project}/sites/site-${$page.params.site}/domains/add-domain/verify?domain=${domain}?redirect=${redirect}?statusCode=${statusCode}`
                        );
                    }
                    //Create domain if it's a new domain
                    else if (isNewDomain) {
                        const domainData = await sdk.forConsole.domains.create(
                            $organization.$id,
                            domain
                        );
                        const sc = Object.values(StatusCode).find(
                            (code) => parseInt(code) === statusCode
                        );
                        await sdk.forProject.proxy.createRedirectRule(domain, redirect, sc);

                        goto(
                            `${base}/project-${$page.params.project}/sites/site-${$page.params.site}/domains/add-domain/verify-${domainData.$id}}`
                        );
                    }
                }
            }
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    }
</script>

<Wizard title="Add custom domain" href={backPage} column columnSize="s" hideFooter={step === 'add'}>
    <Form bind:this={formComponent} onSubmit={addDomain} bind:isSubmitting>
        {#if step === 'add'}
            <Layout.Stack gap="xxl">
                <Layout.Grid columns={3} columnsXS={1}>
                    <LabelCard value="ACTIVE" bind:group={behaviour} title="Active deployment">
                        Point this domain to the latest deployed version.
                    </LabelCard>
                    <Tooltip disabled={!!data.site?.providerRepositoryId}>
                        <div>
                            <LabelCard
                                value="BRANCH"
                                bind:group={behaviour}
                                title="Branch"
                                disabled={!data.site?.providerRepositoryId}>
                                Point this domain to a specific branch in your repository.
                            </LabelCard>
                        </div>
                        <svelte:fragment slot="tooltip">
                            No repository connected to your site.
                        </svelte:fragment>
                    </Tooltip>
                    <LabelCard value="REDIRECT" bind:group={behaviour} title="Redirect">
                        Forward all traffic from this domain to another URL.
                    </LabelCard>
                </Layout.Grid>

                <Fieldset legend="Settings">
                    <Layout.Stack gap="xl">
                        <!-- <Input.ComboBox
                    label="Domain"
                    id="domain"
                    name="domain"
                    bind:value={domain}
                    options={data.domains.rules.map((domain) => ({
                        label: domain.domain,
                        value: domain.domain
                    }))}
                    required
                    placeholder="appwrite.example.com" /> -->
                        <InputDomain
                            label="Domain"
                            id="domain"
                            bind:value={domain}
                            required
                            placeholder="appwrite.example.com" />

                        {#if behaviour === 'BRANCH'}
                            {#if data.site?.providerRepositoryId}
                                {@const sortedBranches = sortBranches(data.branches.branches)}
                                {@const options = sortedBranches.map((branch) => ({
                                    label: branch.name,
                                    value: branch.name
                                }))}
                                <Layout.Stack gap="s">
                                    <InputSelect
                                        {options}
                                        label="Production branch"
                                        id="branch"
                                        required
                                        bind:value={branch}
                                        placeholder="Select branch" />
                                    {#if !data.branches?.total}
                                        <Input.Helper state="default">
                                            No branches found in the selected repository. Create a
                                            branch to see it here.
                                        </Input.Helper>
                                    {/if}
                                </Layout.Stack>
                            {/if}
                        {:else if behaviour === 'REDIRECT'}
                            <InputSelect
                                label="Redirect to"
                                id="redirect"
                                placeholder="Select domain"
                                options={redirectOptions}
                                bind:value={redirect}
                                required>
                                <Tooltip slot="info">
                                    <Icon icon={IconInfo} size="s" />
                                    <span slot="tooltip">
                                        Redirect this domain. Domains added to your project will be
                                        listed here.
                                    </span>
                                </Tooltip>
                            </InputSelect>
                            <InputSelect
                                options={statusCodeOptions}
                                label="Status code"
                                id="code"
                                required
                                bind:value={statusCode}
                                placeholder="Select status code" />
                        {/if}
                        <Divider />
                        <Layout.Stack direction="row" justifyContent="flex-end">
                            <Button on:click={() => (step = 'verify')}>Add</Button>
                        </Layout.Stack>
                    </Layout.Stack>
                </Fieldset>
            </Layout.Stack>
        {:else if step === 'verify'}
            <Card.Base radius="s" padding="s">
                <Layout.Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    gap="xs">
                    <Layout.Stack direction="row" alignItems="center" gap="xs">
                        <Icon icon={IconGlobeAlt} color="--fgcolor-neutral-primary" />

                        <Typography.Text variation="m-500" color="--fgcolor-neutral-primary">
                            {domain}
                        </Typography.Text>
                    </Layout.Stack>
                    <Button
                        secondary
                        href={`${base}/project-${$page.params.project}/sites/create-site/repositories`}>
                        Change
                    </Button>
                </Layout.Stack>
            </Card.Base>
        {/if}
    </Form>

    <svelte:fragment slot="footer">
        <Button secondary href={backPage}>Cancel</Button>
        <Button on:click={() => formComponent.triggerSubmit()} bind:disabled={$isSubmitting}>
            Verify
        </Button>
    </svelte:fragment>
</Wizard>

{#if showConnectRepo}
    <ConnectRepoModal
        bind:show={showConnectRepo}
        site={data.site}
        onlyExisting
        callbackState={{ connectRepo: 'true' }} />
{/if}
