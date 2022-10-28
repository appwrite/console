const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

export function calculateSize(bytes: number, decimals = 1) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function sizeToBytes(value: number, unit: string) {
    const index = sizes.indexOf(unit);
    return value * Math.pow(1024, index);
}
export function bytesToSize(value: number, unit: string) {
    const index = sizes.indexOf(unit);
    return value / Math.pow(1024, index);
}

export function humanFileSize(value: number): {
    value: string;
    unit: string;
} {
    if (!value) return { value: 'No', unit: 'Bytes' };
    const length = value.toString().length;
    const unit =
        length < 7
            ? 'kilobyte'
            : length < 11
            ? 'megabyte'
            : length < 15
            ? 'gigabyte'
            : length < 19
            ? 'terabyte'
            : 'petabyte';

    const formatter = Intl.NumberFormat('en', {
        style: 'unit',
        maximumSignificantDigits: 3,
        maximumFractionDigits: 2,
        unit
    });

    while (value > 1000) {
        value /= 1000;
    }

    const parts: {
        integer: string;
        unit: string;
        fraction?: string;
        decimal?: string;
    } = formatter.formatToParts(value).reduce(
        (prev, curr) => {
            prev[curr.type] = curr.value;

            return prev;
        },
        {
            integer: '',
            unit: '',
            decimal: '',
            fraction: ''
        }
    );

    return {
        value: `${parts.integer}${parts.decimal}${parts.fraction}`,
        unit: parts.unit
    };
}
