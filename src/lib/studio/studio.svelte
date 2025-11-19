<script lang="ts" module>
    export type { AttachOptions } from './studio-widget';
</script>

<script lang="ts">
    import './shim.css';
    import { onMount } from 'svelte';
    import { app } from '$lib/stores/app';
    import { Dependencies } from '$lib/constants';
    import { invalidate } from '$app/navigation';
    import { ensureStudioComponent, initImagine, getWebComponents } from './studio-widget';
    import AddDomains from './domains/add/view.svelte';
    import VerifyDomain from './domains/verify/view.svelte';
    import ManageDomains from './domains/manage/view.svelte';

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
    let showAddDomainsWizard = $state(false);
    let showManageDomainsSheet = $state(false);
    let primaryDomainForSite = $state(`imagine-${projectId}.stage.appwrite.network`);

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
    bind:show={showManageDomainsSheet} />
