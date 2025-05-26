<script context="module" lang="ts">
    export type ExpirationOptions = {
        label: string;
        value: string;
    };
</script>

<script lang="ts">
    import { InputDateTime, InputSelect } from '$lib/elements/forms';
    import { isSameDay, isValidDate, toLocaleDate } from '$lib/helpers/date';

    function incrementToday(value: number, type: 'day' | 'month' | 'year'): string {
        const date = new Date();
        switch (type) {
            case 'day':
                date.setDate(date.getDate() + value);
                break;
            case 'month':
                date.setMonth(date.getMonth() + value);
                break;
            case 'year':
                date.setMonth(date.getMonth() + value * 12);
                break;
        }

        return date.toISOString();
    }

    const defaultOptions: ExpirationOptions[] = [
        {
            label: 'Never',
            value: null
        },
        {
            label: '7 Days',
            value: incrementToday(7, 'day')
        },
        {
            label: '30 days',
            value: incrementToday(30, 'day')
        },
        {
            label: '90 days',
            value: incrementToday(90, 'day')
        },
        {
            label: '1 Year',
            value: incrementToday(1, 'year')
        },
        {
            label: 'Custom Date',
            value: 'custom'
        }
    ];

    const limitedOptions: ExpirationOptions[] = [
        {
            label: '1 Day',
            value: incrementToday(1, 'day')
        },
        {
            label: '7 Days',
            value: incrementToday(7, 'day')
        },
        {
            label: '30 days',
            value: incrementToday(30, 'day')
        }
    ];

    export let value: string | null = null;
    export let dateSelectorLabel: string | undefined = undefined;
    export let selectorLabel: string | undefined = 'Expiration date';
    export let resourceType: string | 'key' | 'token' | undefined = 'key';
    export let expiryOptions: 'default' | 'limited' | ExpirationOptions[] = 'default';

    const options = Array.isArray(expiryOptions)
        ? expiryOptions
        : expiryOptions === 'default'
          ? defaultOptions
          : limitedOptions;

    function initExpirationSelect() {
        if (value === null || !isValidDate(value)) {
            return options[0]?.value ?? null;
        }

        let result = 'custom';
        for (const option of options) {
            if (!isValidDate(option.value)) continue;

            if (isSameDay(new Date(option.value), new Date(value))) {
                result = option.value;
                break;
            }
        }

        return result;
    }

    /**
     * Custom picker only supports `dd/mm/yy` format.
     */
    function splitDateValue(value: string): string {
        return value.slice(0, 10);
    }

    let expirationSelect = initExpirationSelect();
    let expirationCustom: string | null = value ? splitDateValue(value) : null;

    $: {
        if (!isSameDay(new Date(expirationSelect), new Date(value))) {
            value = expirationSelect === 'custom' ? expirationCustom : expirationSelect;
        }
    }

    $: helper =
        expirationSelect !== 'custom' && expirationSelect !== null
            ? `Your ${resourceType} will expire in ${toLocaleDate(value)}`
            : null;
</script>

<InputSelect
    required
    {helper}
    {options}
    id="preset"
    label={selectorLabel}
    bind:value={expirationSelect} />

{#if expirationSelect === 'custom'}
    <InputDateTime required id="expire" label={dateSelectorLabel} bind:value={expirationCustom} />
{/if}
