<script lang="ts">
    import { getUTCOffset, timeFromNow, toLocaleDateTime } from '$lib/helpers/date';
    import { capitalize } from '$lib/helpers/string';
    import { Badge, InteractiveText, Layout, Popover, Typography } from '@appwrite.io/pink-svelte';

    export let time: string = '';
    export let placement: any | string = 'bottom-end';

    function timeDifference(dateString: string): string {
        const SECONDS_IN_MINUTE = 60;
        const SECONDS_IN_HOUR = SECONDS_IN_MINUTE * 60;
        const SECONDS_IN_DAY = SECONDS_IN_HOUR * 24;
        const SECONDS_IN_MONTH = SECONDS_IN_DAY * 30;

        const now = new Date();
        const pastDate = new Date(dateString);

        if (isNaN(pastDate.getTime())) return 'Invalid time';

        const diffInSeconds = Math.floor((now.getTime() - pastDate.getTime()) / 1000);

        const timeParts = [
            { label: 'month', value: Math.floor(diffInSeconds / SECONDS_IN_MONTH) },
            { label: 'day', value: Math.floor(diffInSeconds / SECONDS_IN_DAY) % 30 },
            { label: 'hour', value: Math.floor(diffInSeconds / SECONDS_IN_HOUR) % 24 },
            { label: 'minute', value: Math.floor(diffInSeconds / SECONDS_IN_MINUTE) % 60 }
        ];

        const formattedTime = timeParts
            .filter((unit) => unit.value > 0)
            .slice(0, 3)
            .map((unit) => `${unit.value} ${unit.label}${unit.value > 1 ? 's' : ''}`)
            .join(', ');

        return formattedTime ? `${formattedTime} ago` : 'Just now';
    }

    $: timeToString = time ? timeDifference(time) : 'Invalid time';
</script>

<Popover let:toggle {placement} portal>
    <button on:mouseenter={(e) => toggle(e)}>
        <slot>{capitalize(timeFromNow(time))}</slot>
    </button>

    <Layout.Stack gap="m" alignContent="flex-start" slot="tooltip">
        <Typography.Text color="--fgcolor-neutral-tertiary" variant="m-400"
            >{timeToString}</Typography.Text>

        <Layout.Stack gap="xxs">
            <Layout.Stack direction="row" justifyContent="space-between">
                <Typography.Text variant="m-400">
                    <InteractiveText
                        variant="copy"
                        text={toLocaleDateTime(time, 'UTC')}
                        isVisible />
                </Typography.Text>
                <Badge variant="secondary" content="UTC" size="xs" />
            </Layout.Stack>

            <Layout.Stack direction="row" justifyContent="space-between">
                <Typography.Text variant="m-400">
                    <InteractiveText variant="copy" text={toLocaleDateTime(time)} isVisible />
                </Typography.Text>

                <Badge variant="secondary" content="UTC{getUTCOffset()}" size="xs" />
            </Layout.Stack>
        </Layout.Stack>
    </Layout.Stack>
</Popover>
