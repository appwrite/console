<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Button, Form, InputDomain } from '$lib/elements/forms';
    import { Wizard } from '$lib/layout';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Fieldset, Layout } from '@appwrite.io/pink-svelte';
    import { goto, invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { writable } from 'svelte/store';

    const routeBase = `${base}/project-${page.params.project}/settings/domains`;

    //TODO: enable once combo box is fixed
    // let { data } = $props();

    let formComponent: Form;
    let isSubmitting = $state(writable(false));

    let domainName = $state('');

    async function addDomain() {
        try {
            const rule = await sdk.forProject.proxy.createAPIRule(domainName);
            if (rule?.status === 'verified') {
                await goto(routeBase);
                await invalidate(Dependencies.DOMAINS);
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
        <Layout.Stack gap="xxl">
            <Fieldset legend="Domain">
                <!-- <Input.ComboBox
                    label="Domain"
                    id="domain"
                    name="domain"
                    bind:value={domain}
                    options={data.domains.rules.map((domain) => ({
                        label: domain.domain,
                        value: domain.domain
                    }))}
                    required
                    placeholder="appwrite.example.com" /> -->
                <InputDomain
                    label="Domain"
                    id="domain"
                    bind:value={domainName}
                    required
                    placeholder="appwrite.example.com" />
            </Fieldset>
        </Layout.Stack>
    </Form>

    <svelte:fragment slot="footer">
        <Button secondary href={routeBase}>Cancel</Button>
        <Button on:click={() => formComponent.triggerSubmit()} bind:disabled={$isSubmitting}>
            Add
        </Button>
    </svelte:fragment>
</Wizard>
