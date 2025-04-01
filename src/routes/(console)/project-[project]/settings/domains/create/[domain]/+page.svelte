<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Wizard } from '$lib/layout';
    import {
        Card,
        Fieldset,
        Icon,
        Layout,
        Spinner,
        Status,
        Typography
    } from '@appwrite.io/pink-svelte';
    import Button from '$lib/elements/forms/button.svelte';
    import Form from '$lib/elements/forms/form.svelte';
    import { sdk } from '$lib/stores/sdk';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { addNotification } from '$lib/stores/notifications';
    import { writable } from 'svelte/store';
    import Retry from '$lib/pages/domains/wizard/retry.svelte';
    import { IconClock } from '@appwrite.io/pink-icons-svelte';

    let retrying = false;
    let showExitModal = false;
    let isSubmitting = writable(false);

    export let data;

    let domain = data.domain;

    function onSubmit() {}

    async function retry() {
        try {
            retrying = true;
            domain = await sdk.forProject.proxy.updateRuleVerification(domain.$id);
            invalidate(Dependencies.FUNCTION_DOMAINS);
            addNotification({
                message:
                    domain.status === 'unverified'
                        ? 'Domain certificate has been generated successfully'
                        : 'Domain has been verified successfully',
                type: 'success'
            });
            trackEvent(Submit.DomainUpdateVerification);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.DomainUpdateVerification);
        } finally {
            retrying = false;
        }
    }
</script>

<Wizard
    title={data.domain.domain}
    href={`${base}/project-${page.params.project}/settings/domains/`}
    bind:showExitModal
    column>
    <Form {onSubmit} bind:isSubmitting>
        <Layout.Stack gap="xxl">
            <Card.Base padding="s">
                <Layout.Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography.Text variant="m-500">{data.domain.domain}</Typography.Text>
                    <Button
                        secondary
                        size="s"
                        href={`${base}/project-${page.params.project}/settings/domains/create?domain=${data.domain.domain}&$id=${data.domain.$id}`}
                        >Change</Button>
                </Layout.Stack>
            </Card.Base>
            <Fieldset legend="DNS">
                <Layout.Stack gap="l" alignItems="flex-end">
                    <Layout.Stack>
                        {#if data.domain.status === 'created'}
                            <Retry bind:domain showTitle={false} />
                        {:else}
                            <div class="u-flex u-gap-8 u-cross-center">
                                <span class="icon-check u-color-text-success" aria-hidden="true"
                                ></span>
                                <p class="u-stretch">Domain verified</p>
                            </div>
                        {/if}
                        <Card.Base variant="secondary" padding="s">
                            <Layout.Stack direction="row" gap="s" alignItems="center">
                                {#if domain.status === 'verifying'}
                                    <Spinner size="s" />
                                    <p class="u-stretch">Generating certificate</p>
                                {:else if domain.status === 'verified'}
                                    <Status status="complete" label="Certificate generated" />
                                {:else}
                                    <Icon icon={IconClock} size="s" />
                                    Certificate generation will begin after domain verification
                                {/if}
                            </Layout.Stack>
                        </Card.Base>
                    </Layout.Stack>
                    {#if data.domain.status === 'created'}
                        <Button
                            fullWidthMobile
                            size="s"
                            submit
                            secondary
                            forceShowLoader
                            on:click={retry}
                            disabled={retrying}>
                            Retry
                        </Button>
                    {/if}
                </Layout.Stack>
            </Fieldset>
        </Layout.Stack>
    </Form>

    <svelte:fragment slot="footer">
        <Button
            fullWidthMobile
            secondary
            href={`${base}/project-${page.params.project}/settings/domains`}>
            Go to Domains
        </Button>
    </svelte:fragment>
</Wizard>
