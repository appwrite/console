<script lang="ts">
    import Card from '$lib/components/card.svelte';
    import { Button, InputText } from '$lib/elements/forms';
    import { sdk } from '$lib/stores/sdk';
    import { ResourceType } from '@appwrite.io/console';
    import { Fieldset, Layout, Divider, Status } from '@appwrite.io/pink-svelte';

    export let domain: string;
    const orginalDomain = domain.split('').join('');
    let showConfig = false;
    let domainSuccess = true;

    //TODO: debounce this
    $: if (domain) {
        sdk.forProject.proxy
            .checkSubdomain(ResourceType.Site, domain)
            .then(() => {
                domainSuccess = true;
            })
            .catch(() => {
                domainSuccess = false;
            });
    }
</script>

{#if showConfig}
    <Fieldset legend="Domains">
        <Layout.Stack>
            <Layout.Stack gap="xs">
                <InputText id="domain" placeholder="my-domain" bind:value={domain} />
                <Status
                    status={domainSuccess ? 'complete' : 'failed'}
                    label={domainSuccess ? 'Domain is available' : 'Domain is not available'}>
                </Status>
            </Layout.Stack>
            <Divider />
            <Layout.Stack direction="row" justifyContent="flex-end" gap="s">
                <Button
                    text
                    on:click={() => {
                        domain = orginalDomain;
                        showConfig = false;
                    }}>Cancel</Button>
                <Button secondary disabled={!domainSuccess} on:click={() => (showConfig = false)}
                    >Update</Button>
            </Layout.Stack>
        </Layout.Stack>
    </Fieldset>
{:else}
    <Card isTile>
        <Layout.Stack direction="row" justifyContent="space-between" alignItems="center">
            <p>
                <span class="icon-globe-alt"></span>
                {domain}.appwrite.global
            </p>
            <Button
                secondary
                on:click={() => {
                    showConfig = true;
                }}>
                Change
            </Button>
        </Layout.Stack>
    </Card>
{/if}
