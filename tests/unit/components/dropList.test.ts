import '@testing-library/jest-dom';
import { render, fireEvent } from '@testing-library/svelte';
import DropList from '../../../src/lib/mock/drop.test.svelte';

const data = {
    show: true,
    position: 'top',
    horizontal: 'right'
};

test('shows drop list component', () => {
    render(DropList, { ...data });
    const wrapper = document.querySelector('div');
    const dropList = document.querySelector('ul.drop-list');

    expect(wrapper).toBeInTheDocument();
    expect(dropList).toBeInTheDocument();
});

test('hide drop list on body click', async () => {
    const { component } = render(DropList, { ...data });
    await fireEvent.click(document.body);
    expect(component.show).toStrictEqual(false);
});

test('hide drop list on wrapper click', async () => {
    const { component } = render(DropList, { ...data });
    const wrapper = document.querySelector('div');

    await fireEvent.click(wrapper);
    expect(component.show).toStrictEqual(false);
});

test('drop list visible on list click', async () => {
    render(DropList, { ...data });
    const dropList = document.querySelector('ul.drop-list');

    await fireEvent.click(dropList);
    await new Promise((r) => setTimeout(r, 200));
    expect(dropList).toBeInTheDocument();
});
