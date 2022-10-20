import '@testing-library/jest-dom';
import { render } from '@testing-library/svelte';
// import { render, fireEvent, createEvent } from '@testing-library/svelte';
import { InputFile } from '../../../src/lib/elements/forms';

test('shows file input', () => {
    const { getByText } = render(InputFile, {
        label: 'input',
        files: null,
        list: ['file1', 'file2']
    });
    const label = getByText('input');
    const dropzone = getByText('Drag and drop files here to upload');

    expect(label).toBeInTheDocument();
    expect(dropzone).toBeInTheDocument();
});

// test('file input - dropfile', () => {
//     const { getByText } = render(InputFile, {
//         label: 'input',
//         files: null,
//         list: null
//     });
//     const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
//     const dropzone = getByText('Drag and drop files here to upload');
//     const fileDropEvent = createEvent.drop(dropzone);
//     const fileList = [file];

//     Object.defineProperty(fileDropEvent, 'dataTransfer', {
//         value: {
//             files: {
//                 item: (itemIndex: string) => fileList[itemIndex],
//                 length: fileList.length
//             }
//         }
//     });

//     fireEvent(dropzone, fileDropEvent);

//     expect(getByText('chucknorris.png')).toBeInTheDocument();
// });

// test('file input - upload', () => {
//     const { getByText } = render(InputFile, {
//         label: 'input',
//         files: null,
//         list: ['file1', 'file2']
//     });
//     const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
//     const input = document.getElementsByTagName('input')[0];
//     Object.defineProperty(input, 'files', {
//         value: [file]
//     });

//     fireEvent.drop(input);

//     expect(getByText('chucknorris.png')).toBeInTheDocument();
// });
