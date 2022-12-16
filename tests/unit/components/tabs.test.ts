import '@testing-library/jest-dom';
import { render } from '@testing-library/svelte';
import Tabs from '../../../src/lib/mock/tabs.test.svelte';

const list = [
    {
        title: 'Tab 1',
        href: '#tab-1'
    },
    {
        title: 'Tab 2',
        href: '#tab-2'
    },
    {
        title: 'Tab 3',
        href: '#tab-3'
    }
];

test('shows Tabs component', () => {
    const { container } = render(Tabs, { tabs: list });
    const tabs = container.querySelector('div.tabs');
    const children = tabs?.childNodes;

    expect(tabs).toBeInTheDocument();
    expect(children?.length).toBe(list.length);
});
