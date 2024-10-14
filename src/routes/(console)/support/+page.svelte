<script lang="ts">
    import { afterNavigate, goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import {
        Button,
        Form,
        FormList,
        InputCheckbox,
        InputSelect,
        InputSelectCheckbox,
        InputTextarea,
        Label
    } from '$lib/elements/forms';
    import {
        WizardSecondaryContainer,
        WizardSecondaryContent,
        WizardSecondaryFooter
    } from '$lib/layout';
    import { addNotification } from '$lib/stores/notifications';
    import { user } from '$lib/stores/user';
    import { VARS } from '$lib/system';
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import { sdk } from '$lib/stores/sdk';
    import {
        localeTimezoneName,
        utcHourToLocaleHour,
        utcWeekDayToLocaleWeekDay,
        type WeekDay
    } from '$lib/helpers/date.js';
    import { isSupportOnline } from './store';
    import { Query } from '@appwrite.io/console';
    import { app } from '$lib/stores/app';
    import FormItem from '$lib/elements/forms/formItem.svelte';
    import type { OrganizationList } from '$lib/stores/organization';
    import { BillingPlan } from '$lib/constants';

    let previousPage: string = base;

    afterNavigate(({ from }) => {
        if (from?.url?.pathname) {
            if (from.url.pathname.includes('/login') || from.url.pathname.includes('/register')) {
                previousPage = base;
            } else {
                previousPage = from?.url?.pathname || previousPage;
            }
        } else {
            previousPage = base;
        }
    });

    let originProjectId: string = null;
    let selectedOrgId: string = null;
    let orgs: OrganizationList;
    let formComponent: Form;
    let isSubmitting = writable(false);

    let message: string;
    let category: 'technical' | 'general' | 'billing' = null;
    let categoryOptions = [
        { value: 'general', label: 'General' },
        { value: 'technical', label: 'Technical' },
        { value: 'billing', label: 'Billing' }
    ];
    let product: string[] = [];
    let productOptions = [
        { value: 'auth', label: 'Auth', checked: false },
        { value: 'database', label: 'Database', checked: false },
        { value: 'functions', label: 'Functions', checked: false },
        { value: 'storage', label: 'Storage', checked: false },
        { value: 'messaging', label: 'Messaging', checked: false },
        { value: 'other', label: 'Other', checked: false },
        { value: 'none', label: 'No particular product or serivce', checked: false }
    ];
    let access = false;

    onMount(async () => {
        if ($page.url.searchParams.has('org')) {
            selectedOrgId = $page.url.searchParams.get('org');
        }
        if ($page.url.searchParams.has('project')) {
            originProjectId = $page.url.searchParams.get('project');
        }
        orgs = (await sdk.forConsole.teams.list([
            Query.notEqual('billingPlan', BillingPlan.FREE)
        ])) as unknown as OrganizationList;
    });

    async function handleSubmit() {
        const response = await fetch(`${VARS.GROWTH_ENDPOINT}/support`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                subject: 'support',
                email: $user.email,
                firstName: $user?.name || 'Unknown',
                message: message,
                tags: ['cloud'],
                customFields: [
                    { id: '41612', value: category },
                    { id: '48493', value: $user?.name ?? '' },
                    { id: '48492', value: selectedOrgId ?? '' },
                    { id: '48491', value: originProjectId ?? '' },
                    { id: '48490', value: $user?.$id ?? '' }
                ],
                metaFields: {
                    temporaryAccess: access
                }
            })
        });
        trackEvent(Submit.SupportTicket);
        if (response.status !== 200) {
            trackError(new Error(response.status.toString()), Submit.SupportTicket);
            addNotification({
                message:
                    'There was an error submitting your support ticket. Please try again later.',
                type: 'error'
            });
        } else {
            await goto(previousPage);
            addNotification({
                message:
                    'Your support ticket was submitted successfully. The Appwrite team will get back to you shortly.',
                type: 'success'
            });
        }
    }

    const workTimings = {
        start: '16:00',
        end: '00:00',
        startDay: 'Monday' as WeekDay,
        endDay: 'Friday' as WeekDay
    };

    $: supportTimings = `${utcHourToLocaleHour(workTimings.start)} - ${utcHourToLocaleHour(workTimings.end)} ${localeTimezoneName()}`;
    $: supportWeekDays = `${utcWeekDayToLocaleWeekDay(workTimings.startDay, workTimings.start)} - ${utcWeekDayToLocaleWeekDay(workTimings.endDay, workTimings.end)}`;
</script>

<svelte:head>
    <title>Support - Appwrite</title>
</svelte:head>

<WizardSecondaryContainer href={previousPage}>
    <svelte:fragment slot="title">Support</svelte:fragment>
    <svelte:fragment slot="description">
        Please describe your request in detail, including reproduction steps or screenshots of any
        in-app issues.
    </svelte:fragment>
    <WizardSecondaryContent>
        <Form bind:this={formComponent} onSubmit={handleSubmit} bind:isSubmitting>
            <FormList>
                <InputSelect
                    id="categary"
                    label="Select a category"
                    placeholder="Select category"
                    bind:value={category}
                    options={categoryOptions}
                    required />
                {#if category === 'technical'}
                    <FormItem>
                        <Label required>Select the products or services affected</Label>
                        <InputSelectCheckbox
                            placeholder="Select product or service"
                            name="product"
                            bind:tags={product}
                            options={productOptions.map((option) => ({
                                ...option,
                                checked: product.includes(option.value)
                            }))} />
                    </FormItem>
                {/if}
                {#if orgs?.total && category === 'billing'}
                    <InputSelect
                        id="org"
                        label="Select an organization"
                        placeholder="Select organization"
                        bind:value={selectedOrgId}
                        options={orgs?.teams.map((org) => ({
                            value: org.$id,
                            label: org.name
                        }))} />
                {/if}

                <InputTextarea
                    label="Explain your request"
                    id="message"
                    placeholder="Type here..."
                    bind:value={message}
                    required />
                {#if category === 'technical'}
                    <InputCheckbox
                        required
                        size="small"
                        id="access"
                        bind:checked={access}
                        label="Allow temporary access to my Appwrite account">
                        <svelte:fragment slot="description">
                            <span style="margin-block-start: 1px;">
                                Under some circumstances, you may want to provide access for help
                                with issues related to your projects.
                            </span>
                        </svelte:fragment>
                    </InputCheckbox>
                {/if}
            </FormList>
        </Form>
        <svelte:fragment slot="aside">
            <div class="card u-flex-vertical u-gap-16">
                <p class="text">
                    We will contact you at <b>{$user.email}</b>. We try to respond to all messages
                    within our office hours.
                </p>
                <ul>
                    <li class="text">
                        Available: <b>{supportWeekDays}, {supportTimings}</b>
                    </li>
                    <li class="u-flex u-gap-4 u-cross-center">
                        <span>Currently:</span>
                        {#if isSupportOnline()}
                            <span
                                class="icon-check-circle u-color-text-success"
                                aria-hidden="true" />
                            <span class="u-color-text-success text">Online</span>
                        {:else}
                            <span class="icon-x-circle" aria-hidden="true" />
                            <span class="text">Offline</span>
                        {/if}
                    </li>
                </ul>

                <div class="u-margin-block-start-8 u-width-full-line">
                    {#key $app.themeInUse}
                        <iframe
                            style="color-scheme: none"
                            title="Appwrite Status"
                            src={`https://status.appwrite.online/badge?theme=${
                                $app.themeInUse === 'dark' ? 'dark' : 'light'
                            }`}
                            width="250"
                            height="30"
                            frameborder="0"
                            scrolling="no">
                        </iframe>
                    {/key}
                </div>
            </div>
        </svelte:fragment>
    </WizardSecondaryContent>

    <WizardSecondaryFooter>
        <Button fullWidthMobile secondary href={previousPage}>Cancel</Button>
        <Button
            fullWidthMobile
            on:click={() => {
                if (formComponent.checkValidity()) {
                    handleSubmit();
                }
            }}
            disabled={$isSubmitting}>
            {#if $isSubmitting}
                <span class="loader is-small is-transparent u-line-height-1-5" aria-hidden="true" />
            {/if}
            Submit
        </Button>
    </WizardSecondaryFooter>
</WizardSecondaryContainer>
