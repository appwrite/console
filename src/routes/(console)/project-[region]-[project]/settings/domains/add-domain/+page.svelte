<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Button, Form, InputDomain } from '$lib/elements/forms';
    import { Wizard } from '$lib/layout';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { goto, invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { writable } from 'svelte/store';
    import { onMount } from 'svelte';
    import { isCloud } from '$lib/system';
    import { project } from '$routes/(console)/project-[region]-[project]/store';
    import { getApexDomain } from '$lib/helpers/tlds';
    import type { Models } from '@appwrite.io/console';

    const routeBase = `${base}/project-${page.params.region}-${page.params.project}/settings/domains`;

    let formComponent: Form;
    let isSubmitting = $state(writable(false));
    let domainName = $state('');

    onMount(() => {
        if (page.url.searchParams.has('domain')) {
            domainName = page.url.searchParams.get('domain');
        }
    });

    async function addDomain() {
        const apexDomain = getApexDomain(domainName);
        let domain: Models.Domain;

        if (isCloud && apexDomain) {
            try {
                domain = await sdk.forConsole.domains.create({
                    teamId: $project.teamId,
                    domain: apexDomain
                });
            } catch (error) {}
        }

        try {
            const rule = await sdk
                .forProject(page.params.region, page.params.project)
                .proxy.createAPIRule({ domain: domainName.toLocaleLowerCase() });
            if (rule?.status === 'verified') {
                await goto(routeBase);
                await invalidate(Dependencies.DOMAINS);
                if (isCloud) {
                    try {
                        await sdk.forConsole.domains.updateNameservers({ domainId: domain.$id });
                    } catch (error) {}
                }
            } else {
                await goto(`${routeBase}/add-domain/verify-${domainName}?rule=${rule.$id}`);
                await invalidate(Dependencies.DOMAINS);
            }
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    }
</script>

<Wizard title="Add domain" href={routeBase} column columnSize="s" confirmExit>
    <Form bind:this={formComponent} onSubmit={addDomain} bind:isSubmitting>
        <InputDomain
            label="Domain"
            id="domain"
            bind:value={domainName}
            required
            autofocus
            placeholder="appwrite.example.com" />
    </Form>

    <svelte:fragment slot="footer">
        <Button secondary href={routeBase}>Cancel</Button>
        <Button on:click={() => formComponent.triggerSubmit()} bind:disabled={$isSubmitting}>
            Add
        </Button>
    </svelte:fragment>
</Wizard>
