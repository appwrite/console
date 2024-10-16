export type UserBackupPolicy = {
    id?: string;
    label: string;
    retained: number;
    default: boolean;
    description: string;

    schedule?: string;

    checked?: boolean;
    selectedTime?: string;
    plainTextFrequency?: string;
    weeklySelectedDays?: string[];
    monthlyBackupFrequency?: string;
};

export const cronExpression = (policy: UserBackupPolicy) => {
    const now = new Date();

    if (policy.plainTextFrequency === 'hourly') {
        const utcMinute = now.getUTCMinutes();

        if (!policy.default) {
            policy.schedule = `${utcMinute} * * * *`;
        }
        return;
    }

    let cronExpression = '';

    if (policy.default) {
        // default should use utc.
        cronExpression = policy.schedule;
    } else {
        const [localHour, localMinute] = policy.selectedTime.split(':');
        now.setHours(parseInt(localHour), parseInt(localMinute), 0);

        const utcHour = now.getUTCHours();
        const utcMinute = now.getUTCMinutes();

        if (policy.plainTextFrequency === 'daily') {
            cronExpression = `${utcMinute} ${utcHour} * * *`;
        } else if (policy.plainTextFrequency === 'weekly') {
            const selectedDays = policy.weeklySelectedDays
                ?.map(
                    (dayLabel) =>
                        backupFrequencies.weekly.find((option) => option.label === dayLabel)?.index
                )
                .filter((index) => index !== undefined)
                .join(',');

            // Default to Monday (1)
            cronExpression = `${utcMinute} ${utcHour} * * ${selectedDays || '1'}`;
        } else if (policy.plainTextFrequency === 'monthly') {
            cronExpression = `${utcMinute} ${utcHour} 28 * *`;
        }
    }

    policy.schedule = cronExpression;
};

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

export const backupFrequencies = {
    monthly: [
        { value: 'first', label: 'First day of month', day: '1' },
        { value: 'middle', label: 'Middle of month (15th)', day: '15' },
        { value: 'end', label: 'End of month (28th)', day: '28' }
    ],
    weekly: generateWeeklyOptions(),
    hourly: generateHourlyOptions(1, 12)
};

export const backupPolicyDescription = (
    frequency: string,
    time: string | null = null,
    retained: number | null = null,
    monthlyBackupFrequency: string,
    weeklySelectedDays: string[] | null = null
) => {
    let retainedText = '';
    const timeFormatted = time ?? '';

    if (retained !== null) {
        if (retained === 365 * 100) {
            retainedText = 'forever';
        } else if (retained >= 365) {
            const years = Math.floor(retained / 365);
            retainedText = `${years} year${years > 1 ? 's' : ''}`;
        } else if (retained >= 30) {
            const months = Math.floor(retained / 30);
            retainedText = `${months} month${months > 1 ? 's' : ''}`;
        } else if (retained >= 7) {
            const weeks = Math.floor(retained / 7);
            retainedText = `${weeks} week${weeks > 1 ? 's' : ''}`;
        } else {
            retainedText = `${retained} day${retained > 1 ? 's' : ''}`;
        }
    }

    switch (frequency) {
        case 'hourly':
            return retained !== null
                ? `Runs every hour and is retained for ${retainedText}.`
                : 'A backup will run every hour.';

        case 'daily':
            return retained !== null
                ? `Runs every day and is retained for ${retainedText}.`
                : `A backup will run daily at ${timeFormatted}.`;

        case 'weekly': {
            const daysArray = weeklySelectedDays.length ? weeklySelectedDays : ['Monday'];
            const dayString =
                daysArray.length > 1
                    ? daysArray.slice(0, -1).join(', ') + ' and ' + daysArray.slice(-1)
                    : daysArray[0];
            return retained !== null
                ? `Runs every ${dayString} and is retained for ${retainedText}.`
                : `A backup will run weekly on ${dayString} at ${timeFormatted}.`;
        }

        case 'monthly': {
            const monthDay =
                backupFrequencies[frequency]
                    .find((option) => option.value === monthlyBackupFrequency)
                    ?.label.toLowerCase() || '28th';

            let actualDay: string;
            switch (monthlyBackupFrequency) {
                case 'first':
                    actualDay = '1st';
                    break;
                case 'middle':
                    actualDay = '15th';
                    break;
                case 'end':
                default:
                    actualDay = '28th';
                    break;
            }

            return retained !== null
                ? `Runs every ${actualDay} of the month and is retained for ${retainedText}.`
                : `A backup will run every month on the ${monthDay} at ${timeFormatted}.`;
        }

        default:
            return 'A backup schedule is not set.';
    }
};
