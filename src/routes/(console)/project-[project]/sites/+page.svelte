<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { registerCommands, updateCommandGroupRanks } from '$lib/commandCenter';
    import { Empty, Id, PaginationWithLimit, SvgIcon } from '$lib/components';
    import { Container, ContainerHeader } from '$lib/layout';
    import { isServiceLimited } from '$lib/stores/billing';
    // import { templatesList } from '$lib/stores/templates';
    import { organization } from '$lib/stores/organization';
    import { wizard } from '$lib/stores/wizard';
    import Initial from '$lib/wizards/functions/cover.svelte';
    import { onMount } from 'svelte';
    import { canWriteSites } from '$lib/stores/roles.js';
    import { Layout } from '@appwrite.io/pink-svelte';

    export let data;

    const project = $page.params.project;

    onMount(async () => {
        // const from = $page.url.searchParams.get('from');
        // if (from === 'github') {
        //     const to = $page.url.searchParams.get('to');
        //     switch (to) {
        //         case 'template': {
        //             const step = $page.url.searchParams.get('step');
        //             const template = $page.url.searchParams.get('template');
        //             const templateConfig = $page.url.searchParams.get('templateConfig');
        //             templateStore.set(
        //                 (await $templatesList).templates.find((item) => item.id === template)
        //             );
        //             templateConfigStore.set(JSON.parse(templateConfig));
        //             wizard.start(CreateTemplate);
        //             wizard.setStep(Number(step));
        //             break;
        //         }
        //         case 'cover':
        //             openWizard();
        //             break;
        //     }
        // }
    });

    function openWizard() {
        wizard.showCover(Initial);
    }

    $: $registerCommands([
        {
            label: 'Create site',
            callback: openWizard,
            keys: ['c'],
            disabled:
                $wizard.show ||
                isServiceLimited('sites', $organization?.billingPlan, data.siteList?.total) ||
                !$canWriteSites,
            icon: 'plus',
            group: 'sites'
        }
    ]);

    $updateCommandGroupRanks({ sites: 1000 });

    // TODO: remove
    const TMPSITEROLES = !$canWriteSites;
</script>

<Container>
    <ContainerHeader
        title="Sites"
        buttonText={TMPSITEROLES ? 'Create site' : ''}
        buttonEvent="create_site"
        buttonMethod={openWizard}
        total={data.siteList.total} />
    {#if data.siteList.total}
        <Layout.Stack gap="m" wrap="wrap" direction="row">
            {#each data.siteList.sites as site}
                <a
                    style="height: 218px; width: 275px; outline: 1px solid red; padding: 8px"
                    href={`${base}/project-${project}/sites/sites-${site.$id}`}>
                    <img src={site.preview} style="width: 259px; height: 146px;" alt="" />
                    <!-- <div class="u-flex u-gap-16 u-cross-center">
                        <div class="avatar is-medium">
                            <SvgIcon name={site.runtime.split('-')[0]}></SvgIcon>
                        </div>
                        <span class="text">{site.name}</span>
                    </div> -->
                    <p>{site.name}</p>
                </a>
            {/each}
        </Layout.Stack>

        <PaginationWithLimit
            name="Sites"
            limit={data.limit}
            offset={data.offset}
            total={data.siteList.total} />
    {:else}
        <Empty
            single
            allowCreate={TMPSITEROLES}
            href="https://appwrite.io/docs/products/sites"
            target="site"
            on:click={openWizard} />
    {/if}
</Container>
