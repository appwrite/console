<script lang="ts">
    import { Wizard } from '$lib/layout';
    import { Icon, Input, Layout, Tag, Typography, Button, Card } from '@appwrite.io/pink-svelte';
    import { supportData, isSupportOnline } from './wizard/support/store';
    import { onMount } from 'svelte';
    import { sdk } from '$lib/stores/sdk';
    import { Form, InputSelect, InputText, InputTextarea } from '$lib/elements/forms/index.js';
    import { Query } from '@appwrite.io/console';

    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import {
        localeTimezoneName,
        utcHourToLocaleHour,
        utcWeekDayToLocaleWeekDay,
        type WeekDay
    } from '$lib/helpers/date';
    import { addNotification } from '$lib/stores/notifications';
    import { organization } from '$lib/stores/organization';
    import { user } from '$lib/stores/user';
    import { wizard } from '$lib/stores/wizard';
    import { VARS } from '$lib/system';
    import { onDestroy } from 'svelte';
    import { IconCheckCircle, IconXCircle } from '@appwrite.io/pink-icons-svelte';

    let projectOptions: Array<{ value: string; label: string }>;

    // Topic options based on category
    const topicsByCategory = {
        general: ['Security', 'Compliance', 'Performance'],
        billing: ['Invoices', 'Plans'],
        technical: ['Auth', 'Databases', 'Storage', 'Functions', 'Realtime', 'Messaging', 'Migrations', 'Webhooks', 'SDKs', 'Console']
    };

    // Severity options
    const severityOptions = [
        { value: 'critical', label: 'Critical' },
        { value: 'high', label: 'High' },
        { value: 'medium', label: 'Medium' },
        { value: 'low', label: 'Low' },
        { value: 'question', label: 'Question' }
    ];

    onMount(async () => {
        // Filter projects by organization ID using server-side queries
        const projectList = await sdk.forConsole.projects.list({
            queries: $organization?.$id ? [Query.equal('teamId', $organization.$id)] : []
        });
        projectOptions = projectList.projects.map((project) => ({
            value: project.$id,
            label: project.name
        }));
    });

    // Update topic options when category changes
    $: topicOptions = ($supportData.category ? topicsByCategory[$supportData.category] || [] : []).map((topic) => ({
        value: topic.toLowerCase(),
        label: topic
    }));

    onDestroy(() => {
        $supportData = {
            message: null,
            subject: null,
            category: 'technical',
            topic: undefined,
            severity: undefined,
            file: null
        };
    });

    async function handleSubmit() {
        // Create category-topic tag
        const categoryTopicTag = $supportData.topic 
            ? `${$supportData.category}-${$supportData.topic}`.toLowerCase()
            : $supportData.category.toLowerCase();

        const response = await fetch(`${VARS.GROWTH_ENDPOINT}/support`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: $user.email,
                subject: $supportData.subject,
                firstName: ($user?.name || 'Unknown').slice(0, 40),
                message: $supportData.message,
                tags: [categoryTopicTag],
                customFields: [
                    { id: '41612', value: $supportData.category },
                    { id: '48492', value: $organization?.$id ?? '' },
                    { id: '48491', value: $supportData?.project ?? '' },
                    { id: '56023', value: $supportData?.severity ?? '' },
                    { id: '56024', value: $organization?.billingPlan ?? '' }
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
            category: 'technical',
            topic: undefined,
            severity: undefined,
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

<Wizard title="Contact us" confirmExit={true}>
    <Form onSubmit={handleSubmit}>
        <Layout.Stack gap="xl">
            <Layout.Stack gap="s">
                <Typography.Text
                    >Please describe your request in detail. If applicable, include steps for
                    reproduction of any in-app issues.</Typography.Text>
            </Layout.Stack>
            <Layout.Stack gap="s">
                <Typography.Text color="--fgcolor-neutral-secondary"
                    >Choose a category</Typography.Text>
                <Layout.Stack gap="s" direction="row">
                    {#each ['general', 'billing', 'technical'] as category}
                        <Tag
                            on:click={() => {
                                if ($supportData.category !== category) {
                                    $supportData.topic = undefined;
                                }
                                $supportData.category = category;
                            }}
                            selected={$supportData.category === category}>{category}</Tag>
                    {/each}
                </Layout.Stack>
            </Layout.Stack>
            {#if topicOptions.length > 0}
                <Input.ComboBox
                    id="topic"
                    label="Choose a topic"
                    placeholder="Select topic"
                    bind:value={$supportData.topic}
                    options={topicOptions} />
            {/if}
            <Input.ComboBox
                id="project"
                label="Choose a project"
                options={projectOptions ?? []}
                bind:value={$supportData.project}
                required={false}
                placeholder="Select project" />
            <InputSelect
                id="severity"
                label="Severity"
                options={severityOptions}
                bind:value={$supportData.severity}
                required={true}
                placeholder="Select severity" />
            <InputText
                id="subject"
                label="Subject"
                bind:value={$supportData.subject}
                placeholder="What do you need help with?"
                maxlength={128}
                required />
            <InputTextarea
                id="message"
                bind:value={$supportData.message}
                placeholder="Type here..."
                label="Tell us a bit more"
                maxlength={4096} />
            <Layout.Stack direction="row" justifyContent="flex-end" gap="s">
                <Button.Button
                    size="s"
                    variant="secondary"
                    on:click={() => {
                        wizard.hide();
                    }}>Cancel</Button.Button>
                <Button.Button size="s">Submit</Button.Button>
            </Layout.Stack>
        </Layout.Stack>
    </Form>

    <svelte:fragment slot="aside">
        <Card.Base padding="m">
            <Layout.Stack gap="xl">
                <Typography.Title size="s">Contact the Appwrite Team</Typography.Title>
                <Typography.Text
                    >If you found a bug or have questions, please reach out to the Appwrite team. We
                    try to respond to all messages within our office hours.</Typography.Text>
                <Layout.Stack direction="row" gap="s">
                    <Typography.Text>Available:</Typography.Text>
                    <Typography.Text variant="m-500"
                        >{supportWeekDays}, {supportTimings}</Typography.Text>
                </Layout.Stack>
                <Layout.Stack direction="row" gap="s">
                    <Typography.Text>Currently:</Typography.Text>
                    {#if isSupportOnline()}
                        <Layout.Stack direction="row" gap="xxxs" alignItems="center">
                            <Icon icon={IconCheckCircle} color="--fgcolor-success" />
                            <Typography.Text color="--fgcolor-success">Online</Typography.Text>
                        </Layout.Stack>{:else}
                        <Layout.Stack direction="row" gap="xxxs" alignItems="center">
                            <Icon icon={IconXCircle} />
                            <Typography.Text>Offline</Typography.Text>
                        </Layout.Stack>
                    {/if}
                </Layout.Stack>
            </Layout.Stack>
        </Card.Base>
    </svelte:fragment>
</Wizard>
