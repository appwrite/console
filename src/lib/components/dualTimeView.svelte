<script lang="ts">
    import { type ComponentProps } from 'svelte';
    import { capitalize } from '$lib/helpers/string';
    import { getUTCOffset, timeFromNow, toLocaleDateTime } from '$lib/helpers/date';
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
            { label: 'minute', value: Math.floor(diffInSeconds / SECONDS_IN_MINUTE) % 60 }
        ];

        const formattedTime = timeParts
            .filter((unit) => unit.value > 0)
            .slice(0, 3)
            .map((unit) => `${unit.value} ${unit.label}${unit.value > 1 ? 's' : ''}`)
            .join(', ');

        return formattedTime ? `${formattedTime} ago` : 'Just now';
    }

    let tooltipWrapperId = 'tooltip-wrapper-' + Math.random().toString(36).substring(2, 9);

    $: timeToString = time ? timeDifference(time) : 'Invalid time';

    function shouldHidePopover(hideTooltip: () => void) {
        let isMouseOverTooltip = false;
        const tooltip = document.querySelector(`.${tooltipWrapperId}`);

        if (!tooltip) {
            hideTooltip();
            return;
        }

        if (tooltip) {
            tooltip.addEventListener('mouseenter', () => {
                isMouseOverTooltip = true;
            });

            tooltip.addEventListener('mouseleave', () => {
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
</script>

<div class="dual-time-stamp-wrapper">
    <Popover let:showTooltip let:hideTooltip {placement} portal>
        <button
            on:mouseenter={() => setTimeout(showTooltip, 25)}
            on:mouseleave={() => shouldHidePopover(hideTooltip)}>
            <slot>{capitalize(timeFromNow(time))}</slot>
        </button>

        <Layout.Stack gap="s" alignContent="flex-start" slot="tooltip" class={tooltipWrapperId}>
            <!-- `Raw time` as per design -->
            <Typography.Caption color="--fgcolor-neutral-tertiary" variant="400">
                {timeToString}
            </Typography.Caption>

            <!-- `Absolute time` as per design -->
            <Layout.Stack gap="xxs">
                <!--
                    PR for custom copy [`copyText`]:
                    https://github.com/appwrite/pink/pull/305
                -->
                <Layout.Stack direction="row" justifyContent="space-between">
                    <div class="body-400">
                        <InteractiveText
                            isVisible
                            variant="copy"
                            text={toLocaleDateTime(time, 'UTC')}
                            copyText={new Date(time).toISOString()} />
                    </div>

                    <Badge variant="secondary" content="UTC" size="xs" />
                </Layout.Stack>

                <Layout.Stack direction="row" justifyContent="space-between">
                    <div class="body-400">
                        <InteractiveText
                            isVisible
                            variant="copy"
                            text={toLocaleDateTime(time)}
                            copyText={new Date(time).toLocaleTimeString()} />
                    </div>

                    <Badge variant="secondary" content="UTC{getUTCOffset()}" size="xs" />
                </Layout.Stack>
            </Layout.Stack>
        </Layout.Stack>
    </Popover>
</div>

<style lang="scss">
    :global(body [id^='popover-']:has([class^='tooltip-wrapper-'])) {
        transition: all 0.25s;
    }

    .body-400 {
        & :global(span) {
            font-weight: 400;
            line-height: 140%;
            text-align: start;
            letter-spacing: -0.063px;
            font-size: var(--font-size-s) !important;
            color: var(--fgcolor-neutral-secondary) !important;
            font-family: var(--font-family-sansserif) !important;
        }
    }
</style>
