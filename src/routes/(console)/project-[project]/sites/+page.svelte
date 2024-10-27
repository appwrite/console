<script lang="ts">
    import { registerCommands, updateCommandGroupRanks } from '$lib/commandCenter';
    import { Empty, PaginationWithLimit } from '$lib/components';
    import { Container, ContainerHeader } from '$lib/layout';
    import { isServiceLimited } from '$lib/stores/billing';
    // import { templatesList } from '$lib/stores/templates';
    import { organization } from '$lib/stores/organization';
    import { wizard } from '$lib/stores/wizard';
    import { onMount } from 'svelte';
    import { canWriteSites } from '$lib/stores/roles.js';
    import { Icon, Popover } from '@appwrite.io/pink-svelte';
    import { Button } from '$lib/elements/forms';
    import { IconDotsHorizontal } from '@appwrite.io/pink-icons-svelte';
    import { Card } from '@appwrite.io/pink-svelte';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import CreateSiteModal from './createSiteModal.svelte';

    export let data;
    let show = false;

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

    $: $registerCommands([
        {
            label: 'Create site',
            callback: () => {
                show = true;
            },
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
        buttonMethod={() => (show = true)}
        total={data.siteList.total} />
    {#if data.siteList.total}
        <section class="sites-grid">
            {#each data.siteList.sites as site}
                <Card.Link
                    href={`${base}/project-${$page.params.project}/sites/site-${site.$id}`}
                    padding="xs">
                    <Card.Media
                        title={site.name}
                        description={site.domain}
                        src={site.preview}
                        alt={site.name}>
                        <Popover placement="bottom-end" let:toggle>
                            <Button
                                text
                                icon
                                size="s"
                                on:click={(e) => {
                                    e.preventDefault();
                                    toggle(e);
                                }}>
                                <Icon size="s" icon={IconDotsHorizontal} /></Button>
                            <p slot="tooltip">Tooltip content</p>
                        </Popover>
                    </Card.Media>
                </Card.Link>
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
            on:click={() => (show = true)} />
    {/if}
</Container>

<CreateSiteModal bind:show />

<style lang="scss">
    .sites-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(237.5px, 1fr));
        gap: 1rem;
    }
</style>
