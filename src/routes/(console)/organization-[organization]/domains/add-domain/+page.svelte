<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Button, Form } from '$lib/elements/forms';
    import { InputDomain } from '$lib/elements/forms/index.js';
    import { Wizard } from '$lib/layout';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Divider, Fieldset, Layout } from '@appwrite.io/pink-svelte';
    import RecordsCard from '../recordsCard.svelte';
    import { afterNavigate, invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import type { Domain } from '$lib/sdk/domains';

    let backPage = `${base}/organization-${page.params.organization}/domains`;

    let domainName = '';
    let domain: Domain;

    async function addDomain() {
        try {
            domain = await sdk.forConsole.domains.create(page.params.organization, domainName);
            invalidate(Dependencies.DOMAINS);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    }

    afterNavigate(({ from }) => {
        backPage = from.url?.pathname ?? `${base}/`;
    });
</script>

<Wizard title="Add domain" href={backPage} column columnSize="s" hideFooter>
    {#if domain}
        <RecordsCard {domain} />
    {:else}
        <Fieldset legend="Configuration">
            <Form onSubmit={addDomain}>
                <Layout.Stack gap="xl">
                    <InputDomain
                        label="Domain"
                        id="domain"
                        name="domain"
                        bind:value={domainName}
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
</Wizard>
