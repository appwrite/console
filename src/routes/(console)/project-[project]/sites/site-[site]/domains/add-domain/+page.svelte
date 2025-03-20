<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Button, Form, InputDomain, InputSelect } from '$lib/elements/forms';
    import { Wizard } from '$lib/layout';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import {
        Fieldset,
        Layout,
        Tooltip,
        Icon,
        Input,
        Divider,
        Typography,
        Card
    } from '@appwrite.io/pink-svelte';
    import { goto, invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { sortBranches } from '$lib/stores/vcs';
    import { organization } from '$lib/stores/organization';
    import { consoleVariables, protocol } from '$routes/(console)/store';
    import { IconGlobeAlt, IconInfo } from '@appwrite.io/pink-icons-svelte';
    import { LabelCard } from '$lib/components';
    import { isCloud } from '$lib/system';
    import { StatusCode } from '@appwrite.io/console';
    import VerificationFieldset from './verificationFieldset.svelte';
    import type { Domain } from '$lib/sdk/domains';
    import { statusCodeOptions } from '$lib/stores/domains';

    const backPage = `${base}/project-${$page.params.project}/sites/site-${$page.params.site}/domains`;

    export let data;

    let behaviour: 'REDIRECT' | 'BRANCH' | 'ACTIVE' = 'ACTIVE';
    let step: 'add' | 'verify' = 'add';
    let domainName = '';
    let redirect: string = null;
    let statusCode: number = null;
    let branch = null;

    let domainData: Domain;
    let selectedTab: 'cname' | 'nameserver';

    const redirectOptions = data.domains.rules
        .filter((d) => !d.domain.endsWith($consoleVariables._APP_DOMAIN_SITES))
        .map((domain) => ({
            label: domain.domain,
            value: domain.domain
        }));

    async function addDomain() {
        const isNewDomain =
            data.domains.rules.findIndex((rule) => rule.domain === domainName) === -1;
        try {
            if (isNewDomain && isCloud) {
                domainData = await sdk.forConsole.domains.create($organization.$id, domainName);
            }

            if (behaviour === 'BRANCH') {
                await sdk.forProject.proxy.createSiteRule(domainName, $page.params.site, branch);
            } else if (behaviour === 'REDIRECT') {
                const sc = Object.values(StatusCode).find((code) => parseInt(code) === statusCode);
                console.log(statusCode, sc);
                await sdk.forProject.proxy.createRedirectRule(domainName, $protocol + redirect, sc);
            } else if (behaviour === 'ACTIVE') {
                await sdk.forProject.proxy.createSiteRule(domainName, $page.params.site);
            }

            addNotification({
                type: 'success',
                message: 'Domain added successfully'
            });
            await goto(backPage);
            await invalidate(Dependencies.DOMAINS);
            await invalidate(Dependencies.SITES_DOMAINS);
        } catch (error) {
            await invalidate(Dependencies.DOMAINS);

            addNotification({
                type: 'error',
                message: error.message
            });
        }
    }

    $: isVerified = domainData?.nameservers
        ? domainData?.nameservers.toLocaleLowerCase() === 'appwrite'
        : undefined;
</script>

<Wizard title="Add custom domain" href={backPage} column columnSize="s" hideFooter={step === 'add'}>
    <Form onSubmit={() => (step = 'verify')}>
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
                                title="Git branch"
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
                            bind:value={domainName}
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
                            <Button submit>Add</Button>
                        </Layout.Stack>
                    </Layout.Stack>
                </Fieldset>
            </Layout.Stack>
        {:else if step === 'verify'}
            <Layout.Stack gap="xxl">
                <Card.Base radius="s" padding="s">
                    <Layout.Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        gap="xs">
                        <Layout.Stack direction="row" alignItems="center" gap="xs">
                            <Icon icon={IconGlobeAlt} color="--fgcolor-neutral-primary" />

                            <Typography.Text variation="m-500" color="--fgcolor-neutral-primary">
                                {domainName}
                            </Typography.Text>
                        </Layout.Stack>
                        <Button secondary on:click={() => (step = 'add')}>Change</Button>
                    </Layout.Stack>
                </Card.Base>

                <VerificationFieldset domain={domainName} verified={isVerified} bind:selectedTab />
            </Layout.Stack>
        {/if}
    </Form>

    <svelte:fragment slot="footer">
        <Button secondary href={backPage}>Cancel</Button>
        <Button on:click={addDomain}>Verify</Button>
    </svelte:fragment>
</Wizard>
