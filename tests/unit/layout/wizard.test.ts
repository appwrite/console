import '@testing-library/jest-dom';
import { render } from '@testing-library/svelte';
import { sleep } from '$lib/helpers/promises';
import { wizard } from '../../../src/lib/stores/wizard';
import { tick } from 'svelte';
import userEvent from '@testing-library/user-event';
import WizardComponent from '../../../src/lib/mock/wizard.test.svelte';
import WizardContainer from '../../../src/lib/mock/wizard.container.test.svelte';

test('shows wizard and hides it', async () => {
    const { queryByText } = render(WizardContainer);

    /**
     * Wizard is hidden before started.
     */
    expect(queryByText('wizard-title')).not.toBeInTheDocument();
    expect(queryByText('step-1')).not.toBeInTheDocument();
    expect(queryByText('sub-title-1')).not.toBeInTheDocument();
    expect(queryByText('step-2')).not.toBeInTheDocument();
    expect(queryByText('sub-title-2')).not.toBeInTheDocument();

    wizard.start(WizardComponent);
    await tick();

    /**
     * First step is shown, second is hidden.
     */
    expect(queryByText('wizard-title')).toBeInTheDocument();
    expect(queryByText('step-1')).toBeInTheDocument();
    expect(queryByText('sub-title-1')).toBeInTheDocument();

    expect(queryByText('step-2')).not.toBeInTheDocument();
    expect(queryByText('sub-title-2')).not.toBeInTheDocument();

    wizard.hide();
    await tick();

    /**
     * Wizard is hidden.
     */
    expect(queryByText('wizard-title')).not.toBeInTheDocument();
    expect(queryByText('step-1')).not.toBeInTheDocument();
    expect(queryByText('sub-title-1')).not.toBeInTheDocument();
    expect(queryByText('step-2')).not.toBeInTheDocument();
    expect(queryByText('sub-title-2')).not.toBeInTheDocument();
});

test('shows next step with submit', async () => {
    const { container, queryByText } = render(WizardContainer);

    wizard.start(WizardComponent);
    await tick();

    const form = container.querySelector('form') as HTMLFormElement;
    const step1 = queryByText('step-1');
    const step1Required = container.querySelector('#step-1-required');
    const step1Optional = container.querySelector('#step-1-optional');

    expect(step1).toBeInTheDocument();
    expect(step1Required).toBeInTheDocument();
    expect(step1Optional).toBeInTheDocument();

    form.dispatchEvent(new Event('submit'));
    await sleep(100);

    expect(step1).not.toBeInTheDocument();

    const step2 = queryByText('step-2');
    const step2First = container.querySelector('#step-2-first');
    const step2Second = container.querySelector('#step-2-second');

    expect(step2).toBeInTheDocument();
    expect(step2First).toBeInTheDocument();
    expect(step2Second).toBeInTheDocument();

    form.dispatchEvent(new Event('submit'));
    await tick();

    expect(form).not.toBeInTheDocument();
    expect(step1).not.toBeInTheDocument();
    expect(step2).not.toBeInTheDocument();
});

test('intercepts submit', async () => {
    const { container, queryByText } = render(WizardContainer);

    wizard.start(WizardComponent);
    await tick();

    const form = container.querySelector('form') as HTMLFormElement;
    const step1 = queryByText('step-1');
    const step1Required = container.querySelector('#step-1-required');
    const step1Optional = container.querySelector('#step-1-optional');

    expect(step1).toBeInTheDocument();
    expect(step1Required).toBeInTheDocument();
    expect(step1Optional).toBeInTheDocument();

    await userEvent.type(step1Required, 'fail');

    form.dispatchEvent(new Event('submit'));
    await sleep(100);

    expect(step1).toBeInTheDocument();
    expect(step1Required).toBeInTheDocument();
    expect(step1Optional).toBeInTheDocument();

    await userEvent.type(step1Required, 'works');
    form.dispatchEvent(new Event('submit'));
    await sleep(100);

    expect(step1).not.toBeInTheDocument();

    const step2 = queryByText('step-2');
    const step2First = container.querySelector('#step-2-first');
    const step2Second = container.querySelector('#step-2-second');

    expect(step2).toBeInTheDocument();
    expect(step2First).toBeInTheDocument();
    expect(step2Second).toBeInTheDocument();

    form.dispatchEvent(new Event('submit'));
    await tick();

    expect(form).not.toBeInTheDocument();
    expect(step1).not.toBeInTheDocument();
    expect(step2).not.toBeInTheDocument();
});
