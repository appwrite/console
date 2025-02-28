<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Button, Form } from '$lib/elements/forms';
    import { InputDomain } from '$lib/elements/forms/index.js';
    import { Wizard } from '$lib/layout';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Divider, Fieldset, Layout } from '@appwrite.io/pink-svelte';
    import RecordsCard from '../recordsCard.svelte';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import type { Domain } from '$lib/sdk/domains';

    const backPage = `${base}/project-${$page.params.organization}/domains`;

    let domain = '';
    let domainData: Domain;

    async function addDomain() {
        try {
            domainData = await sdk.forConsole.domains.create($page.params.organization, domain);
            console.log(domainData);
            invalidate(Dependencies.DOMAINS);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    }

    async function verifyStatus() {
        try {
            domainData = await sdk.forConsole.domains.updateNameservers(domainData.$id);
            console.log(domainData);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    }

    async function back() {
        try {
            await sdk.forConsole.domains.delete(domainData.$id);
            domainData = undefined;
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    }
</script>

<Wizard title="Add domain" href={backPage} column columnSize="s" hideFooter={!domainData}>
    {#if domainData}
        <RecordsCard domain={domainData}>
            <Divider />
            <Layout.Stack direction="row" justifyContent="flex-end">
                <Button text on:click={back}>Back</Button>
                <Button secondary on:click={verifyStatus}>Verify</Button>
            </Layout.Stack>
        </RecordsCard>
    {:else}
        <Fieldset legend="Configuration">
            <Form onSubmit={addDomain}>
                <Layout.Stack gap="xl">
                    <InputDomain
                        label="Domain"
                        id="domain"
                        name="domain"
                        bind:value={domain}
                        required
                        placeholder="example.com" />

                    <Divider />
                    <Layout.Stack alignItems="flex-end">
                        <Button submit>Add</Button>
                    </Layout.Stack>
                </Layout.Stack>
            </Form>
        </Fieldset>
    {/if}

    <svelte:fragment slot="footer">
        <Button text href={backPage}>Cancel</Button>
        {#if domainData}
            <Button secondary href={backPage}>Skip to console</Button>
        {/if}
    </svelte:fragment>
</Wizard>
