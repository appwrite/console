<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { tooltip } from '$lib/actions/tooltip';
    import { registerCommands, updateCommandGroupRanks } from '$lib/commandCenter';
    import {
        CardContainer,
        Empty,
        GridItem1,
        Id,
        PaginationWithLimit,
        SvgIcon
    } from '$lib/components';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { Container, ContainerHeader } from '$lib/layout';
    import { isServiceLimited } from '$lib/stores/billing';
    import { templatesList } from '$lib/stores/templates';
    import { organization } from '$lib/stores/organization';
    import { wizard } from '$lib/stores/wizard';
    import Initial from '$lib/wizards/functions/cover.svelte';
    import { parseExpression } from 'cron-parser';
    import { onMount } from 'svelte';
    import type { Models } from '@appwrite.io/console';

    export let data;

    let offset = 0;

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

    // $: $registerCommands([
    //     {
    //         label: 'Create site',
    //         callback: openWizard,
    //         keys: ['c'],
    //         disabled:
    //             $wizard.show ||
    //             isServiceLimited('sites', $organization?.billingPlan, $functionsList?.total) ||
    //             !$canWriteFunctions,
    //         icon: 'plus',
    //         group: 'sites'
    //     }
    // ]);

    // $updateCommandGroupRanks({ functions: 1000 });
</script>

<Container>
    <ContainerHeader
        title="Sites"
        buttonText={true ? 'Create site' : ''}
        buttonEvent="create_site"
        buttonMethod={openWizard}
        total={data.siteList.total} />
    {#if data.siteList.total}
        {#each data.siteList.sites as site}
            <GridItem1 href={`${base}/project-${project}/sites/sites-${site.$id}`}>
                <svelte:fragment slot="title">
                    <div class="u-flex u-gap-16 u-cross-center">
                        <div class="avatar is-medium">
                            <SvgIcon name={site.runtime.split('-')[0]}></SvgIcon>
                        </div>
                        <span class="text">{site.name}</span>
                    </div>
                </svelte:fragment>

                <Id value={site.$id} event="site">{site.$id}</Id>
            </GridItem1>
        {/each}

        <PaginationWithLimit
            name="Sites"
            limit={data.limit}
            offset={data.offset}
            total={data.siteList.total} />
    {:else}
        <Empty
            single
            allowCreate={true}
            href="https://appwrite.io/docs/products/sites"
            target="site"
            on:click={openWizard} />
    {/if}
</Container>
