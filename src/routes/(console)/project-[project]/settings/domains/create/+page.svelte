<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Wizard } from '$lib/layout';
    import { Fieldset, Layout } from '@appwrite.io/pink-svelte';
    import Button from '$lib/elements/forms/button.svelte';
    import Form from '$lib/elements/forms/form.svelte';
    import { writable } from 'svelte/store';
    import { InputDomain } from '$lib/elements/forms';
    import { goto } from '$app/navigation';
    import { sdk } from '$lib/stores/sdk';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';

    let showExitModal = false;
    let formComponent: Form;
    let isSubmitting = writable(false);

    export let data;

    let domain = data.domain;

    async function create() {
        try {
            if (data.$id) {
                await sdk.forProject.proxy.deleteRule(data.$id);
            }

            const value = await sdk.forProject.proxy.createAPIRule(domain);

            trackEvent(Submit.DomainCreate);
            goto(`${base}/project-${page.params.project}/settings/domains/create/${value.$id}`);
        } catch (e) {
            trackError(e.message, Submit.DomainCreate);
            throw new Error(e.message);
        }
    }
</script>

<Wizard
    title="Create custom domain"
    href={`${base}/project-${page.params.project}/settings/domains`}
    bind:showExitModal
    column
    hideFooter
    confirmExit>
    <Form bind:this={formComponent} onSubmit={create} bind:isSubmitting>
        <Layout.Stack gap="xxl">
            <Fieldset legend="Configuration">
                <Layout.Stack gap="l" alignItems="flex-end">
                    <Layout.Stack gap="s">
                        <InputDomain
                            id="domain"
                            label="Domain"
                            placeholder="appwrite.example.com"
                            autocomplete={false}
                            required
                            bind:value={domain} />
                    </Layout.Stack>
                    <Button
                        fullWidthMobile
                        size="s"
                        submit
                        forceShowLoader
                        on:click={() => formComponent.triggerSubmit()}
                        disabled={$isSubmitting}>
                        Create domain
                    </Button>
                </Layout.Stack>
            </Fieldset>
        </Layout.Stack>
    </Form>
</Wizard>
