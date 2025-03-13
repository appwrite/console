<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Button, Form, InputSelect } from '$lib/elements/forms';
    import { Wizard } from '$lib/layout';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Fieldset, Layout, Tooltip, Icon, Alert } from '@appwrite.io/pink-svelte';
    import { goto, invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { sortBranches } from '$lib/stores/vcs';
    import { organization } from '$lib/stores/organization';
    import { consoleVariables } from '$routes/(console)/store';
    import InputDomain from '$lib/elements/forms/inputDomain.svelte';
    import { IconInfo } from '@appwrite.io/pink-icons-svelte';
    import { LabelCard } from '$lib/components';
    import { writable } from 'svelte/store';
    import { isCloud } from '$lib/system';
    import { onMount } from 'svelte';
    import { StatusCode } from '@appwrite.io/console';
    import ConnectRepoModal from '../../(modals)/connectRepoModal.svelte';

    const backPage = `${base}/project-${$page.params.project}/functions/function-${$page.params.function}/domains`;

    export let data;

    let formComponent: Form;
    let isSubmitting = writable(false);

    let showConnectRepo = false;
    let behaviour: 'REDIRECT' | 'CREATE' = 'CREATE';
    let domain = '';
    let redirect: string = null;
    let statusCode: number = null;
    let branch = null;

    const redirectOptions = data.domains.rules
        .filter((d) => !d.domain.endsWith($consoleVariables._APP_DOMAIN_TARGET))
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
        const isPreviewDomain = domain.endsWith($consoleVariables._APP_DOMAIN_TARGET);
        const isNewDomain = data.domains.rules.findIndex((rule) => rule.domain === domain) === -1;
        const isSubDomain = domain.split('.').length >= 2;
        try {
            if (behaviour === 'CREATE') {
                if (isCloud && !isPreviewDomain) {
                    //Redirect if subdomain so user can choose how to proceed
                    if (isSubDomain) {
                        goto(
                            `${base}/project-${$page.params.project}/functions/function-${$page.params.function}/domains/add-domain/verify?domain=${domain}`
                        );
                    }
                    //Create domain if it's a new domain
                    else if (isNewDomain) {
                        const domainData = await sdk.forConsole.domains.create(
                            $organization.$id,
                            domain
                        );
                        await sdk.forProject.proxy.createFunctionRule(
                            domain,
                            $page.params.function,
                            branch
                        );
                        goto(
                            `${base}/project-${$page.params.project}/functions/function-${$page.params.function}/domains/add-domain/verify-${domainData.$id}}`
                        );
                    }
                }
                //if selfhosted or preview domain create function rule
                else {
                    await sdk.forProject.proxy.createFunctionRule(
                        domain,
                        $page.params.function,
                        branch
                    );
                    addNotification({
                        type: 'success',
                        message: 'Domain added successfully'
                    });
                    await goto(backPage);
                    await invalidate(Dependencies.FUNCTION_DOMAINS);
                }
            } else if (behaviour === 'REDIRECT') {
                if (isCloud && !isPreviewDomain) {
                    //Redirect if subdomain so user can choose how to proceed
                    if (isSubDomain) {
                        goto(
                            `${base}/project-${$page.params.project}/functions/function-${$page.params.function}/domains/add-domain/verify?domain=${domain}?redirect=${redirect}?statusCode=${statusCode}`
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
                            `${base}/project-${$page.params.project}/functions/function-${$page.params.function}/domains/add-domain/verify-${domainData.$id}}`
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

<Wizard title="Add custom domain" href={backPage} column columnSize="s">
    <Form bind:this={formComponent} onSubmit={addDomain} bind:isSubmitting>
        <Layout.Stack gap="xxl">
            <Fieldset legend="Details">
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
            </Fieldset>

            <Layout.Grid columns={2} columnsXS={1}>
                <LabelCard
                    value="CREATE"
                    bind:group={behaviour}
                    title="Connect to active deployment">
                    Connect this domain to your active deployment and configure the linked Git
                    branch as needed.
                </LabelCard>
                <LabelCard
                    value="REDIRECT"
                    bind:group={behaviour}
                    title="Redirect to another domain">
                    Automatically forward traffic from this domain to another URL of your choice.
                </LabelCard>
            </Layout.Grid>

            {#if behaviour === 'CREATE'}
                <Fieldset legend="Configuration">
                    <Layout.Stack gap="xl">
                        {#if data.branches?.total}
                            {@const sortedBranches = sortBranches(data.branches.branches)}
                            {@const options = sortedBranches.map((branch) => ({
                                label: branch.name,
                                value: branch.name
                            }))}
                            <InputSelect
                                {options}
                                label="Production branch"
                                id="branch"
                                required
                                bind:value={branch}
                                placeholder="Select branch" />
                        {:else}
                            <InputSelect
                                disabled
                                options={[{ label: 'main', value: 'main' }]}
                                label="Production branch"
                                id="branch"
                                required
                                value="main"
                                placeholder="Select branch" />

                            <Alert.Inline
                                title=" There is no repository connected to your function">
                                <Layout.Stack>
                                    <p>
                                        The domain will be connected to your active deployment.
                                        Connect your Git repository to link a production branch.
                                    </p>
                                    <div>
                                        <Button compact on:click={() => (showConnectRepo = true)}>
                                            Connect repository
                                        </Button>
                                    </div>
                                </Layout.Stack>
                            </Alert.Inline>
                        {/if}
                    </Layout.Stack>
                </Fieldset>

                <!-- {:else if data.function.installationId || data.installations?.total}
                    <PinkCard.Base padding="none" border="dashed">
                        <Empty
                            type="secondary"
                            title="Connect Git repository"
                            description="Link a repository to associate your domain with an active deployment.">
                            <svelte:fragment slot="actions">
                                <Button secondary on:click={() => (showConnectRepo = true)}>
                                    <Icon icon={IconGithub} size="s" slot="start" />
                                    Connect Git repository
                                </Button>
                            </svelte:fragment>
                        </Empty>
                    </PinkCard.Base>
                {:else}
                    <ConnectGit callbackState={{ newInstallation: 'true' }} />
                {/if} -->
            {:else if behaviour === 'REDIRECT'}
                <Fieldset legend="Configuration">
                    <Layout.Stack gap="xl">
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
                    </Layout.Stack>
                </Fieldset>
            {/if}
        </Layout.Stack>
    </Form>
    <svelte:fragment slot="footer">
        <Button secondary href={backPage}>Cancel</Button>
        <Button on:click={() => formComponent.triggerSubmit()} bind:disabled={$isSubmitting}>
            Add
        </Button>
    </svelte:fragment>
</Wizard>

{#if showConnectRepo}
    <ConnectRepoModal
        bind:show={showConnectRepo}
        func={data.function}
        callbackState={{ connectRepo: 'true' }} />
{/if}
