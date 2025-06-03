<script lang="ts">
    import { InputText } from '$lib/elements/forms';
    import Button from '$lib/elements/forms/button.svelte';
    import { debounce } from '$lib/helpers/debounce';
    import { sdk } from '$lib/stores/sdk';
    import { ConsoleResourceType } from '@appwrite.io/console';
    import { Fieldset, Layout, Status, Typography } from '@appwrite.io/pink-svelte';
    import { onMount } from 'svelte';
    import { regionalConsoleVariables } from '$routes/(console)/project-[region]-[project]/store';

    export let domain: string;
    export let domainIsValid = true;
    const originalDomain = domain;
    let newDomain = domain;

    let domainStatus: 'complete' | 'failed' | 'pending' = 'complete';

    onMount(async () => {});

    function setDomainLabel(status: typeof domainStatus) {
        switch (status) {
            case 'complete':
                return 'Domain is available';
            case 'failed':
                return 'Domain is not available';
            case 'pending':
                return 'Checking domain availability';
        }
    }

    const checkDomain = debounce(async (value: string) => {
        if (!value) {
            domainStatus = 'failed';
            return;
        }
        try {
            await sdk.forConsole.console.getResource(
                `${value}.${$regionalConsoleVariables._APP_DOMAIN_SITES}`,
                ConsoleResourceType.Rules
            );
            domainStatus = 'complete';
            domainIsValid = true;
        } catch {
            domainStatus = 'failed';
            domainIsValid = false;
        } finally {
            domain = newDomain;
        }
    }, 500);

    $: if (domain !== newDomain) {
        domainStatus = 'pending';
        checkDomain(newDomain);
    }
</script>

<Fieldset legend="Domains">
    <Layout.Stack gap="s">
        <Layout.Stack gap="s" direction="row" alignItems="center">
            <InputText id="domain" placeholder="my-domain" bind:value={newDomain}>
                <svelte:fragment slot="end">
                    <Typography.Text variant="m-400" color="--fgcolor-neutral-tertiary">
                        .{$regionalConsoleVariables._APP_DOMAIN_SITES}
                    </Typography.Text>
                </svelte:fragment>
            </InputText>
            <Button
                secondary
                disabled={originalDomain === newDomain}
                on:click={() => (newDomain = originalDomain)}>Reset</Button>
        </Layout.Stack>
        <Status status={domainStatus} label={setDomainLabel(domainStatus)}></Status>
    </Layout.Stack>
</Fieldset>
