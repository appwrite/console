<script lang="ts">
    import { afterNavigate, goto, invalidate, preloadData } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Dependencies } from '$lib/constants';
    import { Button, Form } from '$lib/elements/forms';
    import {
        WizardSecondaryContainer,
        WizardSecondaryContent,
        WizardSecondaryFooter
    } from '$lib/layout';
    import { addNotification } from '$lib/stores/notifications';
    import { writable } from 'svelte/store';

    let previousPage: string = base;
    let showExitModal = false;

    afterNavigate(({ from }) => {
        previousPage = from?.url?.pathname || previousPage;
    });

    let formComponent: Form;
    let isSubmitting = writable(false);

    let name: string;

    async function create() {
        try {
            let site;

            trackEvent(Submit.OrganizationCreate, {});

            await invalidate(Dependencies.ACCOUNT);
            await preloadData(`${base}/project-${$page.params.project}/sites/site-${site.$id}`);
            await goto(`${base}/project-${$page.params.project}/sites/site-${site.$id}`);
            addNotification({
                type: 'success',
                message: `${name ?? 'Organization'} has been created`
            });
        } catch (e) {
            addNotification({
                type: 'error',
                message: e.message
            });
            trackError(e, Submit.OrganizationCreate);
        }
    }
</script>

<svelte:head>
    <title>Create site - Appwrite</title>
</svelte:head>

<WizardSecondaryContainer bind:showExitModal href={previousPage} confirmExit>
    <svelte:fragment slot="title">Create organization</svelte:fragment>
    <WizardSecondaryContent>
        <Form bind:this={formComponent} onSubmit={create} bind:isSubmitting>
            I'm wanna be a site! :)
        </Form>
        <svelte:fragment slot="aside">I'm an aside! :)</svelte:fragment>
    </WizardSecondaryContent>

    <WizardSecondaryFooter>
        <Button fullWidthMobile secondary on:click={() => (showExitModal = true)}>Cancel</Button>
        <Button
            fullWidthMobile
            on:click={() => formComponent.triggerSubmit()}
            disabled={$isSubmitting}>
            Create site
        </Button>
    </WizardSecondaryFooter>
</WizardSecondaryContainer>
