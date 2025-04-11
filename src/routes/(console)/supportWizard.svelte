<script lang="ts">
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import {
        localeTimezoneName,
        utcHourToLocaleHour,
        utcWeekDayToLocaleWeekDay,
        type WeekDay
    } from '$lib/helpers/date';
    import { Wizard } from '$lib/layout';
    import type { WizardStepsType } from '$lib/layout/wizard.svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { organization } from '$lib/stores/organization';
    import { user } from '$lib/stores/user';
    import { wizard } from '$lib/stores/wizard';
    import { VARS } from '$lib/system';
    import { onDestroy } from 'svelte';
    import Step1 from './wizard/support/step1.svelte';
    import { isSupportOnline, supportData } from './wizard/support/store';

    onDestroy(() => {
        $supportData = {
            message: null,
            subject: null,
            category: 'general',
            file: null
        };
    });

    const stepsComponents: WizardStepsType = new Map();

    stepsComponents.set(1, {
        label: 'How can we help you?',
        component: Step1
    });

    async function handleSubmit() {
        const response = await fetch(`${VARS.GROWTH_ENDPOINT}/support`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: $user.email,
                subject: $supportData.subject,
                firstName: $user?.name || 'Unknown',
                message: $supportData.message,
                tags: ['cloud'],
                customFields: [
                    { id: '41612', value: $supportData.category },
                    { id: '48493', value: $user?.name ?? '' },
                    { id: '48492', value: $organization?.$id ?? '' },
                    { id: '48491', value: $supportData?.project ?? '' },
                    { id: '48490', value: $user?.$id ?? '' }
                ]
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
            addNotification({
                message:
                    'Your support ticket was submitted successfully. The Appwrite team will get back to you shortly.',
                type: 'success'
            });
        }
        resetData();
        wizard.hide();
    }

    function resetData() {
        $supportData = {
            message: null,
            subject: null,
            category: 'general',
            file: null,
            project: null
        };
    }

    $wizard.finalAction = handleSubmit;

    const workTimings = {
        start: '16:00',
        end: '00:00',
        startDay: 'Monday' as WeekDay,
        endDay: 'Friday' as WeekDay
    };

    $: supportTimings = `${utcHourToLocaleHour(workTimings.start)} - ${utcHourToLocaleHour(workTimings.end)} ${localeTimezoneName()}`;
    $: supportWeekDays = `${utcWeekDayToLocaleWeekDay(workTimings.startDay, workTimings.start)} - ${utcWeekDayToLocaleWeekDay(workTimings.endDay, workTimings.end)}`;
</script>

<Wizard title="Contact us" steps={stepsComponents} finalAction="Submit" on:exit={resetData}>
    <svelte:fragment slot="aside">
        <h4 class="body-text-1 u-bold">Contact the Appwrite Team</h4>
        <p class="text u-margin-block-start-16">
            If you found a bug or have questions, please reach out to the Appwrite team. We try to
            respond to all messages within our office hours.
        </p>
        <p class="text u-margin-block-start-32">
            Available: <b>{supportWeekDays}, {supportTimings}</b>
        </p>
        <div class="u-flex u-gap-4 u-cross-center">
            <span>Currently:</span>
            {#if isSupportOnline()}
                <span class="icon-check-circle u-color-text-success" aria-hidden="true" />
                <span class="u-color-text-success text">Online</span>
            {:else}
                <span class="icon-x-circle" aria-hidden="true" />
                <span class="text">Offline</span>
            {/if}
        </div>
    </svelte:fragment>
</Wizard>
