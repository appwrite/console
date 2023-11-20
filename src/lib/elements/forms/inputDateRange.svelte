<script lang="ts">
    import { createDateRangePicker, type DateRange } from '@melt-ui/svelte';
    import { Label } from '.';
    const {
        elements: {
            calendar,
            cell,
            content,
            grid,
            heading,
            nextButton,
            prevButton,
            startSegment,
            endSegment,
            trigger
        },
        states: { months, headingValue, daysOfWeek, segmentContents, value },
        helpers: { isDateDisabled, isDateUnavailable }
    } = createDateRangePicker();

    export let data: DateRange;
    export let showLabel = true;
    export let label: string;
    export let id: string;
    export let required = false;
    export let hideRequired = false;
    export let tooltip: string;
    export let optionalText: string;
    export let showDates = true;

    $: if ($value) {
        data = $value;
    }

    $: console.log(data);
</script>

{#if label}
    <Label {required} {hideRequired} {tooltip} {optionalText} hide={!showLabel} for={id}>
        {label}
    </Label>
    <!-- <span class="label" use:label>Hotel Nights</span> -->
{/if}
<div class="u-flex u-gap-4">
    {#if showDates}
        {#each $segmentContents.start as seg}
            <div {...$startSegment(seg.part)} use:startSegment>
                {seg.value}
            </div>
        {/each}
        <div aria-hidden="true">-</div>
        {#each $segmentContents.end as seg}
            <div {...$endSegment(seg.part)} use:endSegment>
                {seg.value}
            </div>
        {/each}
    {/if}
    <div>
        <button {...$trigger} use:trigger class="button is-secondary" type="button">
            <slot>Open calendar</slot>
        </button>
    </div>
</div>
<div {...$content} use:content class="card dt-container">
    <div {...$calendar} use:calendar class="u-flex u-flex-vertical">
        <header class="u-flex u-main-space-between u-cross-center">
            <button type="button" class="button is-only-icon is-text" use:prevButton>
                <span class="icon-cheveron-left" aria-label="previous month"></span>
            </button>
            <div {...$heading} use:heading>
                {$headingValue}
            </div>
            <button type="button" class="button is-only-icon is-text" use:nextButton>
                <span class="icon-cheveron-right" aria-label="next month"></span>
            </button>
        </header>
        {#each $months as month}
            <table use:grid>
                <thead aria-hidden="true">
                    <tr>
                        {#each $daysOfWeek as day}
                            <th class="dt-cell">
                                <span class="u-flex u-main-center u-cross-center">
                                    {day}
                                </span>
                            </th>
                        {/each}
                    </tr>
                </thead>
                <tbody>
                    {#each month.weeks as days}
                        <tr>
                            {#each days as date}
                                <td
                                    class="dt-cell"
                                    role="gridcell"
                                    aria-disabled={$isDateDisabled(date) ||
                                        $isDateUnavailable(date)}>
                                    <div
                                        {...$cell(date, month.value)}
                                        use:cell
                                        class="u-flex u-main-center u-cross-center dt-button">
                                        {date.day}
                                    </div>
                                </td>
                            {/each}
                        </tr>
                    {/each}
                </tbody>
            </table>
        {/each}
    </div>
</div>

<style lang="scss">
    :global(.theme-dark) .dt-button {
        --dt-text-hover: var(--color-neutral-20);
        --dt-button-hover: var(--color-neutral-200);
        --dt-border-hover: var(--color-neutral-70);
        --dt-text-active: var(--color-neutral-60);
        --dt-button-active: var(--color-neutral-200);
        --dt-border-active: var(--color-neutral-60);
    }
    :global(.theme-light) .dt-button {
        --dt-text-hover: var(--color-neutral-100);
        --dt-button-hover: var(--color-neutral-30);
        --dt-border-hover: var(--color-neutral-15);
        --dt-text-active: var(--color-neutral-100);
        --dt-button-active: var(--color-neutral-30);
        --dt-border-active: var(--color-neutral-15);
    }

    .dt-container {
        min-width: 20rem;
    }
    .dt-cell {
        height: 1.5rem;
        width: 1.5rem;
        padding: 0.1rem;
        border-radius: 100%;
        user-select: none;

        [aria-disabled='true'] {
            pointer-events: none;
            opacity: 0.4;
        }
    }
    .dt-button {
        aspect-ratio: 1/1;
        border-radius: 100%;
        cursor: pointer;
        &:hover,
        &[data-highlighted],
        &[data-range-highlighted] {
            background-color: hsl(var(--dt-button-hover));
            color: hsl(var(--dt-text-hover));
        }
        &[data-selected] {
            background-color: hsl(var(--dt-button-active));
            color: hsl(var(--dt-text-active));
        }
    }

    // [data-melt-calendar-cell][data-unavailable] {
    //     @apply pointer-events-none text-red-400 line-through;
    // }

    // [data-melt-calendar-cell][data-selected] {
    //     @apply bg-magnum-400 text-neutral-950;
    // }

    // [data-melt-calendar-cell][data-outside-visible-months] {
    //     @apply pointer-events-none cursor-default opacity-40 hover:bg-transparent;
    // }

    // [data-melt-calendar-cell][data-outside-month] {
    //     @apply pointer-events-none cursor-default opacity-0 hover:bg-transparent;
    // }
</style>
