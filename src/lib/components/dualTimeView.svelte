<script lang="ts">
    import { type ComponentProps } from 'svelte';
    import { capitalize } from '$lib/helpers/string';
    import { getUTCOffset, timeFromNow, toLocaleDateTime } from '$lib/helpers/date';
    import { Badge, InteractiveText, Layout, Popover, Typography } from '@appwrite.io/pink-svelte';

    export let time: string = '';
    export let placement: ComponentProps<Popover>['placement'] = 'bottom';

    let isTooltipStyled = false;
    let tooltipElement: HTMLDivElement | null = null;

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

    function shouldHidePopover(hideTooltip: () => void) {
        let isMouseOverTooltip = false;

        if (!tooltipElement) {
            hideTooltip();
            return;
        }

        if (tooltipElement) {
            tooltipElement.addEventListener('mouseenter', () => {
                isMouseOverTooltip = true;
            });

            tooltipElement.addEventListener('mouseleave', () => {
                isMouseOverTooltip = false;
                hideTooltip();
            });
        }

        setTimeout(() => {
            if (!isMouseOverTooltip) {
                hideTooltip();
            }
        }, 50);
    }

    $: timeToString = time ? timeDifference(time) : 'Invalid time';

    $: if (tooltipElement && !isTooltipStyled) {
        isTooltipStyled = true;
        // transition to tooltip's wrapper (div[class^='popover-*'])
        tooltipElement.parentElement.style.transition ||= 'all 0.25s ease-in-out';
    }
</script>

<Popover let:show let:hide {placement} portal>
    <button
        on:mouseenter={() => setTimeout(show, 25)}
        on:mouseleave={() => shouldHidePopover(hide)}>
        <slot>{capitalize(timeFromNow(time))}</slot>
    </button>

    <div
        slot="tooltip"
        class="tooltip-wrapper"
        style:padding-top="1rem"
        style:margin-top="-1rem"
        style:padding-bottom="1rem"
        style:margin-bottom="-1rem"
        bind:this={tooltipElement}>
        <Layout.Stack gap="s" alignContent="flex-start">
            <!-- `Raw time` as per design -->
            <Typography.Caption color="--fgcolor-neutral-tertiary" variant="400">
                {timeToString}
            </Typography.Caption>

            <!-- `Absolute time` as per design -->
            <Layout.Stack gap="xxs">
                <Layout.Stack direction="row" justifyContent="space-between">
                    <div class="body-400">
                        <InteractiveText
                            isVisible
                            variant="copy"
                            text={toLocaleDateTime(time, 'UTC')}
                            value={new Date(toLocaleDateTime(time, 'UTC')).toISOString()} />
                    </div>

                    <Badge variant="secondary" content="UTC" size="xs" />
                </Layout.Stack>

                <Layout.Stack direction="row" justifyContent="space-between">
                    <div class="body-400">
                        <InteractiveText
                            isVisible
                            variant="copy"
                            text={toLocaleDateTime(time)}
                            value={new Date(toLocaleDateTime(time)).toISOString()} />
                    </div>

                    <Badge variant="secondary" content="UTC{getUTCOffset()}" size="xs" />
                </Layout.Stack>
            </Layout.Stack>
        </Layout.Stack>
    </div>
</Popover>
