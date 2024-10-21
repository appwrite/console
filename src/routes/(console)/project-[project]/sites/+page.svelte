<script lang="ts">
    import { registerCommands, updateCommandGroupRanks } from '$lib/commandCenter';
    import { Empty, PaginationWithLimit } from '$lib/components';
    import { Container, ContainerHeader } from '$lib/layout';
    import { isServiceLimited } from '$lib/stores/billing';
    // import { templatesList } from '$lib/stores/templates';
    import { organization } from '$lib/stores/organization';
    import { wizard } from '$lib/stores/wizard';
    import Initial from '$lib/wizards/functions/cover.svelte';
    import { onMount } from 'svelte';
    import { canWriteSites } from '$lib/stores/roles.js';
    import { Icon, Popover } from '@appwrite.io/pink-svelte';
    import { Button } from '$lib/elements/forms';
    import { IconDotsHorizontal } from '@appwrite.io/pink-icons-svelte';
    import SiteCard from './siteCard.svelte';

    export let data;

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
        <section class="sites-grid">
            {#each data.siteList.sites as site}
                <SiteCard {site}>
                    <Popover placement="bottom-end" let:toggle>
                        <Button
                            text
                            icon
                            size="small"
                            on:click={(e) => {
                                e.preventDefault();
                                toggle(e);
                            }}>
                            <Icon size="small" icon={IconDotsHorizontal} /></Button>
                        <p slot="tooltip">Tooltip content</p>
                    </Popover>
                </SiteCard>
            {/each}
        </section>

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

<style lang="scss">
    .sites-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(237.5px, 1fr));
        gap: 1rem;
    }
</style>
