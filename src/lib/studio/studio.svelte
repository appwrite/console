<script lang="ts" module>
    export type { AttachOptions } from './studio-widget';
</script>

<script lang="ts">
    import './shim.css';
    import { onMount } from 'svelte';
    import { app } from '$lib/stores/app';
    import { Dependencies } from '$lib/constants';
    import { goto, invalidate } from '$app/navigation';
    import { ensureStudioComponent, initImagine, getWebComponents } from './studio-widget';
    import AddDomains from './domains/add/view.svelte';
    import VerifyDomain from './domains/verify/view.svelte';
    import ManageDomains from './domains/manage/view.svelte';
    import { sdk } from '$lib/stores/sdk';
    import { resolve } from '$app/paths';
    import { get } from 'svelte/store';
    import { organization as organizationStore } from '$lib/stores/organization';

    const {
        region,
        projectId,
        userId
    }: {
        region: string;
        projectId: string;
        userId: string;
    } = $props();

    const siteId = `project-${projectId}`;
    const isStage = sdk.forConsole.client.config.endpoint.includes('stage');
    let showAddDomainsWizard = $state(false);
    let showManageDomainsSheet = $state(false);
    let primaryDomainForSite = $state(
        `imagine-${projectId}.${isStage ? 'stage.' : ''}appwrite.network`
    );

    let showVerifyDomainsWizard = $state(false);
    let ruleIdForVerification = $state(null);
    let domainForVerification = $state(null);

    onMount(() => {
        ensureStudioComponent();

        initImagine(region, projectId, userId, {
            onProjectNameChange: () => {
                invalidate(Dependencies.PROJECT);
            },
            onAddDomain: async () => {
                showAddDomainsWizard = true;
            },
            onManageDomains: (primaryDomain) => {
                if (primaryDomain) {
                    primaryDomainForSite = primaryDomain;
                }
                showManageDomainsSheet = true;
            },
            onUpgrade: async () => {
                const organization = get(organizationStore).$id;
                await goto(
                    resolve('/(console)/organization-[organization]/change-plan', {
                        organization: organization
                    })
                );
            }
        });

        return app.subscribe(async ($app) => {
            try {
                const { changeTheme } = await getWebComponents();
                if (changeTheme) {
                    changeTheme($app.themeInUse);
                }
            } catch (error) {
                console.error('Failed to change theme:', error);
            }
        });
    });
</script>

<div aria-hidden="true" style:display="none"></div>

<AddDomains
    {siteId}
    bind:show={showAddDomainsWizard}
    onDomainAdded={(rule, domain, verified) => {
        if (!verified) {
            ruleIdForVerification = rule;
            domainForVerification = domain;
            showVerifyDomainsWizard = true;
        }
    }} />

<VerifyDomain
    rule={ruleIdForVerification}
    domain={domainForVerification}
    bind:show={showVerifyDomainsWizard}
    onChangeDomain={() => {
        ruleIdForVerification = null;
        domainForVerification = null;
        showAddDomainsWizard = true;
    }} />

<ManageDomains
    {siteId}
    {region}
    {projectId}
    domain={primaryDomainForSite}
    bind:show={showManageDomainsSheet}
    onAddNewDomain={() => {
        showAddDomainsWizard = true;
        showManageDomainsSheet = false;
    }} />
