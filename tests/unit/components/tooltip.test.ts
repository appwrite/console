import '@testing-library/jest-dom';
import { render } from '@testing-library/svelte';
import { Tooltip } from '../../../src/lib/components';

test('shows tooltip', () => {
    const { getByRole } = render(Tooltip);

    expect(getByRole('tooltip')).toBeInTheDocument();
});
