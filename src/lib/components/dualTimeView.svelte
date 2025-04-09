<script lang="ts">
    import { type ComponentProps } from 'svelte';
    import { capitalize } from '$lib/helpers/string';
    import {
        timeFromNow,
        toLocaleDateTime,
        toLocalDateTimeISO,
        toISOString
    } from '$lib/helpers/date';
    import { Badge, InteractiveText, Layout, Popover, Typography } from '@appwrite.io/pink-svelte';

    export let time: string = '';
    export let placement: ComponentProps<Popover>['placement'] = 'bottom';

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
            { label: 'minute', value: Math.floor(diffInSeconds / SECONDS_IN_MINUTE) % 60 },
            { label: 'second', value: diffInSeconds % 60 }
        ];

        const month = timeParts[0].value;
        const day = timeParts[1].value;
        const hour = timeParts[2].value;
        const second = timeParts[4].value;

        let outputParts: { label: string; value: number }[];

        if (month === 0 && day === 0 && hour === 0 && second > 0) {
            // Seconds exist but no months, days, hours — show minutes + seconds
            outputParts = timeParts.slice(3).filter((unit) => unit.value > 0);
        } else {
            // Normal logic — top 3 non-zero units, no seconds.
            outputParts = timeParts
                .filter((unit) => unit.label !== 'second' && unit.value > 0)
                .slice(0, 3);
        }

        const formattedTime = outputParts
            .map((unit) => `${unit.value} ${unit.label}${unit.value > 1 ? 's' : ''}`)
            .join(', ');

        return formattedTime ? `${formattedTime} ago` : 'Just now';
    }

    let isMouseOverTooltip = false;
    function hidePopover(hideTooltip: () => void, timeout = true) {
        if (!timeout) {
            isMouseOverTooltip = false;
            return hideTooltip();
        }

        setTimeout(() => {
            if (!isMouseOverTooltip) {
                hideTooltip();
            }
        }, 50);
    }

    $: timeToString = time ? timeDifference(time) : 'Invalid time';
</script>

<Popover let:show let:hide {placement} portal>
    <button
        on:mouseenter={() => {
            if (!document.getElementById('actionmenuopen')) {
                setTimeout(show, 150);
            }
        }}
        on:mouseleave={() => hidePopover(hide)}>
        <slot>{capitalize(timeFromNow(time))}</slot>
    </button>

    <div
        let:hide
        slot="tooltip"
        role="tooltip"
        style:padding="1rem"
        style:margin="-1rem"
        on:mouseenter={() => (isMouseOverTooltip = true)}
        on:mouseleave={() => hidePopover(hide, false)}>
        <Layout.Stack gap="s" alignContent="flex-start">
            <!-- `Raw time` as per design -->
            <Typography.Caption color="--fgcolor-neutral-tertiary" variant="400">
                {timeToString}
            </Typography.Caption>

            <!-- `Absolute time` as per design -->
            <Layout.Stack gap="xxs">
                <Layout.Stack
                    direction="row"
                    alignItems="center"
                    alignContent="center"
                    justifyContent="space-between">
                    <InteractiveText
                        isVisible
                        variant="copy"
                        text={toLocaleDateTime(time, 'UTC')}
                        value={toISOString(time)} />

                    <Badge variant="secondary" content="UTC" size="xs" />
                </Layout.Stack>

                <Layout.Stack
                    direction="row"
                    alignItems="center"
                    alignContent="center"
                    justifyContent="space-between">
                    <InteractiveText
                        isVisible
                        variant="copy"
                        text={toLocaleDateTime(time)}
                        value={toLocalDateTimeISO(time)} />
                    <Badge variant="secondary" content="Local" size="xs" />
                </Layout.Stack>
            </Layout.Stack>
        </Layout.Stack>
    </div>
</Popover>
