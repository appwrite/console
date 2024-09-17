<script lang="ts">
    import { Modal } from '$lib/components';
    import {
        Button,
        FormList,
        InputRadio,
        InputSelect,
        InputText,
        InputTime,
        Label
    } from '$lib/elements/forms';

    import { addNotification } from '$lib/stores/notifications';
    import { capitalize } from '$lib/helpers/string';
    import { backupRetainingOptions, database } from '../store';
    import { sdk } from '$lib/stores/sdk';
    import { ID } from '@appwrite.io/console';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';

    export let showCreate = false;

    // TODO: Layout design for modal has changed, make changes.

    // TODO: improve options below.
    const generateHourlyOptions = (start: number, end: number) =>
        Array.from({ length: end - start + 1 }, (_, i) => ({
            value: `${i + start}`,
            label: `${i + start}`
        }));

    const generateWeeklyOptions = () =>
        ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(
            (day, index) => ({
                label: day,
                value: day,
                index: index,
                checked: false
            })
        );

    const backupFrequencies = {
        monthly: [
            { value: 'first', label: 'First day of month', day: '1' },
            { value: 'middle', label: 'Middle of month (15th)', day: '15' },
            { value: 'end', label: 'End of month (28th)', day: '28' }
        ],
        weekly: generateWeeklyOptions(),
        hourly: generateHourlyOptions(1, 12)
    };

    let error: string;
    let selectedTime: string = '00:00';
    let backupPolicyName: string = null;
    let policyFrequency: string = 'monthly';

    let policyRetention: number = 30;
    let backupFrequency: string = 'end';

    const generateCronExpression = () => {
        const [localHour, localMinute] = selectedTime.split(':');

        // Convert local time to UTC
        const now = new Date();
        now.setHours(parseInt(localHour), parseInt(localMinute), 0);

        const utcHour = now.getUTCHours();
        const utcMinute = now.getUTCMinutes();

        let dayOfWeek = '*';
        let dayOfMonth = '*';

        if (policyFrequency === 'monthly') {
            // Default to 28th of every month.
            const selectedDay = backupFrequencies.monthly.find(
                (option) => option.value === backupFrequency
            )?.day;
            dayOfMonth = selectedDay || '28';
        } else if (policyFrequency === 'weekly') {
            // Monday
            dayOfWeek = '1';
        } else if (policyFrequency === 'hourly') {
            return `${new Date().getMinutes()} * * * *`;
        }

        return `${utcMinute} ${utcHour} ${dayOfMonth} * ${dayOfWeek}`;
    };

    // TODO: reset values on modal close.
    const createPolicy = async () => {
        try {
            const cronExpression = generateCronExpression();

            await sdk.forProject.backups.createPolicy(
                ID.unique(),
                ['databases'],
                policyRetention,
                cronExpression,
                backupPolicyName,
                $database.$id,
                true
            );

            error = null;
            showCreate = false;
            addNotification({
                isHtml: true,
                type: 'success',
                message: `<b>${backupPolicyName}</b> backup policy has been created`
            });

            resetFormVariables();
            invalidate(Dependencies.BACKUPS);
        } catch (err) {
            addNotification({
                type: 'error',
                message: err.message
            });
        }
    };

    $: backupScheduleText = () => {
        const timeFormatted = formatTime24to12(selectedTime);

        switch (policyFrequency) {
            case 'hourly':
                return 'A backup will run every hour.';
            case 'daily':
                return `A backup will run daily at ${timeFormatted}.`;
            case 'weekly':
                return `A backup will run weekly on Monday at ${timeFormatted}.`;
            case 'monthly': {
                const monthDay = backupFrequencies[policyFrequency]
                    .find((option) => option.value === backupFrequency)
                    .label.toLowerCase();
                return `A backup will run monthly on the ${monthDay} at ${timeFormatted}.`;
            }
            default:
                return 'A backup schedule is not set.';
        }
    };

    function formatTime24to12(time24: string) {
        const [hour, minute] = time24.split(':');
        const hourInt = parseInt(hour, 10);
        const suffix = hourInt >= 12 ? 'PM' : 'AM';
        const hour12 = ((hourInt + 11) % 12) + 1;
        return `${hour12}:${minute} ${suffix}`;
    }

    function resetFormVariables() {
        error = null;
        selectedTime = '00:00';
        backupPolicyName = null;
        policyFrequency = 'monthly';

        policyRetention = 30;
        backupFrequency = 'end';
    }
</script>

<Modal
    title="Create backup policy"
    size="big"
    bind:show={showCreate}
    onSubmit={createPolicy}
    bind:error>
    <FormList>
        <div class="u-flex-vertical u-gap-8">
            <Label>Frequency</Label>
            <div class="u-flex u-gap-16 input-radio-group">
                {#each ['hourly', 'daily', 'weekly', 'monthly'] as freq}
                    <InputRadio
                        label={freq.charAt(0).toUpperCase() + freq.slice(1)}
                        id={freq}
                        bind:group={policyFrequency}
                        value={freq}
                        name="radio" />
                {/each}
            </div>
        </div>

        <div class="u-flex-vertical u-gap-8">
            <div class="u-flex u-gap-8 time-holder">
                {#if policyFrequency === 'monthly'}
                    <InputSelect
                        id="monthly"
                        label="Monthly Timing"
                        bind:value={backupFrequency}
                        placeholder="End of month (28th)"
                        fullWidth
                        options={backupFrequencies[policyFrequency]} />
                {/if}

                {#if policyFrequency !== 'hourly'}
                    <div class:u-margin-block-start-4={policyFrequency !== 'daily'}>
                        <InputTime
                            id="time"
                            bind:value={selectedTime}
                            label={policyFrequency === 'daily' || policyFrequency === 'weekly'
                                ? 'Timing'
                                : ''} />
                    </div>
                {/if}
            </div>
            <span>{backupScheduleText()}</span>
        </div>

        <div class="u-flex-vertical u-gap-8">
            <InputSelect
                fullWidth
                id="retention"
                label="Keep for"
                placeholder="3 months"
                bind:value={policyRetention}
                options={backupRetainingOptions} />
            <span>
                {#if policyRetention === 365 * 100}
                    Every backup created under this policy will be retained <b>forever</b>.
                {:else}
                    Every backup created under this policy will be retained for <b
                        >{backupRetainingOptions.find((option) => option.value === policyRetention)
                            ?.label ?? '3 months'}</b> before being automatically deleted.
                {/if}
            </span>
        </div>

        <InputText
            id="name"
            label="Policy name"
            placeholder="{capitalize(policyFrequency)} backup"
            autofocus
            bind:value={backupPolicyName}
            required />
    </FormList>

    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (showCreate = false)}>Cancel</Button>
        <Button submit>Create</Button>
    </svelte:fragment>
</Modal>

<style>
    .input-radio-group :global(.input-text-wrapper) {
        gap: 0.5rem;
        display: flex;
    }
</style>
