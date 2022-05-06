import '@testing-library/jest-dom';
import { render, fireEvent } from '@testing-library/svelte';
import { DropList } from '../../../src/lib/components';

const data = {
    show: true,
    position: 'top',
    horizontal: 'right'
};

test('shows drop list component', () => {
    render(DropList, { ...data });
    const wrapper = document.querySelector('div');
    const dropList = document.querySelector('ul');

    expect(wrapper).toBeInTheDocument();
    expect(dropList).toBeInTheDocument();
});

test('hide drop list on body click', async () => {
    render(DropList, { ...data });
    const body = document.querySelector('body');
    const dropList = document.querySelector('ul');

    await fireEvent.click(body);
    expect(dropList).not.toBeInTheDocument();
});

test('hide drop list on wrapper click', async () => {
    render(DropList, { ...data });
    const wrapper = document.querySelector('div');
    const dropList = document.querySelector('ul');

    await fireEvent.click(wrapper);
    expect(dropList).not.toBeInTheDocument();
});

test('drop list visible on list click', async () => {
    render(DropList, { ...data });
    const dropList = document.querySelector('ul');

    await fireEvent.click(dropList);
    expect(dropList).toBeInTheDocument();
});
