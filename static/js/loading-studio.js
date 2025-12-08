function createAnimatedLogo(root) {
    // pattern encoded exactly like your React element tree
    const pattern = [
        // row 1
        '',
        'size1',
        'size2',
        'size3',
        'size3',
        'size2',
        'size1',
        '',
        // row 2
        'size2',
        'size3',
        'size4',
        'size5',
        'size5',
        'size4',
        'size3',
        'size2',
        // row 3
        'size3',
        'size4',
        'size8',
        'size8',
        'size8',
        'size8',
        'size4',
        'size3',
        // row 4
        'size3',
        'size5',
        'size8',
        'size9',
        'size9',
        'size8',
        'size5',
        'size3',
        // row 5
        'size3',
        'size5',
        'size8',
        'size9',
        'size9',
        'size8',
        'size5',
        'size3',
        // row 6
        'size3',
        'size4',
        'size8',
        'size8',
        'size8',
        'size8',
        'size4',
        'size3',
        // row 7
        'size2',
        'size3',
        'size4',
        'size5',
        'size5',
        'size4',
        'size3',
        'size2',
        // row 8
        '',
        'size1',
        'size2',
        'size3',
        'size3',
        'size2',
        'size1',
        ''
    ];

    // build container
    const grid = document.createElement('div');
    grid.className = 'gridContainer';

    // optional background square (hidden by default)
    const backgroundSquare = document.createElement('div');
    backgroundSquare.className = 'backgroundSquare';
    grid.appendChild(backgroundSquare);

    // insert circles and blanks
    pattern.forEach((size) => {
        const el = document.createElement('div');
        if (size) {
            el.classList.add('circle', size);
        }
        grid.appendChild(el);
    });

    root.appendChild(grid);
}

createAnimatedLogo(document.querySelector('.page-loader'));
