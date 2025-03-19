<script lang="ts">
    import Card from '$lib/components/card.svelte';
    import { Button, InputText } from '$lib/elements/forms';
    import { debounce } from '$lib/helpers/debounce';
    import { sdk } from '$lib/stores/sdk';
    import { consoleVariables } from '$routes/(console)/store';
    import { ConsoleResourceType } from '@appwrite.io/console';
    import { Fieldset, Layout, Divider, Status, Typography } from '@appwrite.io/pink-svelte';

    export let domain: string;
    export let domainIsValid = true;
    const orginalDomain = domain.split('').join('');
    let showConfig = false;

    const checkDomain = debounce(async (value: string) => {
        try {
            await sdk.forConsole.console.getResource(
                `${value}.${$consoleVariables._APP_DOMAIN_SITES}`,
                ConsoleResourceType.Rules
            );

            domainIsValid = true;
        } catch {
            domainIsValid = false;
        }
    }, 300);

    $: if (domain) {
        checkDomain(domain);
    }
</script>

{#if showConfig}
    <Fieldset legend="Domains">
        <Layout.Stack>
            <Layout.Stack gap="s">
                <InputText id="domain" placeholder="my-domain" bind:value={domain}>
                    <svelte:fragment slot="end">
                        <Typography.Text variant="m-400" color="--fgcolor-neutral-tertiary">
                            .{$consoleVariables._APP_DOMAIN_SITES}
                        </Typography.Text>
                    </svelte:fragment>
                </InputText>
                <Status
                    status={domainIsValid ? 'complete' : 'failed'}
                    label={domainIsValid ? 'Domain is available' : 'Domain is not available'}>
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

                <Button secondary disabled={!domainIsValid} on:click={() => (showConfig = false)}>
                    Update
                </Button>
            </Layout.Stack>
        </Layout.Stack>
    </Fieldset>
{:else}
    <Card padding="s" radius="s">
        <Layout.Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography.Text variant="m-400" color="--fgcolor-neutral-primary">
                <Layout.Stack direction="row" gap="s" alignItems="center">
                    <span class="icon-globe-alt"></span>
                    {domain}.{$consoleVariables._APP_DOMAIN_SITES}
                </Layout.Stack>
            </Typography.Text>
            <Button
                size="s"
                secondary
                on:click={() => {
                    showConfig = true;
                }}>
                Update
            </Button>
        </Layout.Stack>
    </Card>
{/if}
