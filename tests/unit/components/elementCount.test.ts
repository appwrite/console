import '@testing-library/jest-dom';
import { render } from '@testing-library/svelte';
import { ElementCount } from '../../../src/lib/components';

test('shows correct count', () => {
    const { getByText } = render(ElementCount, {
        count: 1
    });
    expect(getByText(/1/i)).toBeInTheDocument();
});
