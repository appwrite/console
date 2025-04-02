import { describe, it, expect, beforeEach } from 'vitest';
import {
    createStreamParser,
    StreamParser,
    type ParsedItem,
    type Action,
    type TextChunk
} from './parser';

function expectAction(item: ParsedItem): asserts item is Action {
    expect('type' in item).toBe(true);
}
function expectText(item: ParsedItem): asserts item is TextChunk {
    expect(!('type' in item) && 'content' in item).toBe(true);
}

describe('stream parser', () => {
    let parser: StreamParser;

    beforeEach(() => {
        parser = createStreamParser();
    });

    it('should parse text chunks correctly', () => {
        const text = 'Hello, world!';
        parser.chunk(text);
        parser.end();

        let items: ParsedItem[] = [];
        parser.parsed.subscribe((value) => {
            items = value;
        })();

        expect(items.length).toBe(1);
        expect(items[0].content).toBe(text);
        expect(typeof items[0].id).toBe('symbol');
    });

    it('should parse file actions correctly', () => {
        const actionText = '<action type="file" src="test.js">console.log("test");</action>';
        parser.chunk(actionText);
        parser.end();

        let items: ParsedItem[] = [];
        parser.parsed.subscribe((value) => {
            items = value;
        })();

        expect(items.length).toBe(1);

        const [item] = items;
        expectAction(item);
        expect(item.type === 'file').toBe(true);
        expect(item.src).toBe('test.js');
        expect(item.content).toBe('console.log("test");');
        expect(item.complete).toBe(true);
    });

    it('should parse shell actions correctly', () => {
        const actionText = '<action type="shell">npm install</action>';
        parser.chunk(actionText);
        parser.end();

        let items: ParsedItem[] = [];
        parser.parsed.subscribe((value) => {
            items = value;
        })();

        expect(items.length).toBe(1);

        const [item] = items;
        expectAction(item);
        expect(item.type).toBe('shell');
        expect(item.content).toBe('npm install');
        expect(item.complete).toBe(true);
    });

    it('should handle mixed content correctly', () => {
        const text = 'Text before <action type="shell">npm install</action> Text after';
        parser.chunk(text);
        parser.end();

        let items: ParsedItem[] = [];
        parser.parsed.subscribe((value) => {
            items = value;
        })();

        expect(items.length).toBe(3);
        console.log(items);
        const [text1, action, text2] = items;
        expectAction(action);
        expectText(text1);
        expectText(text2);
        expect(text1.content).toBe('Text before ');
        expect(action.type).toBe('shell');
        expect(action.content).toBe('npm install');
        expect(text2.content).toBe(' Text after');
    });

    it('should handle chunked input correctly', () => {
        parser.chunk('Text before ');
        parser.chunk('<action type="file" ');
        parser.chunk('src="test.js">');
        parser.chunk('console.log');
        parser.chunk('("test");');
        parser.chunk('</action>');
        parser.chunk(' Text after');
        parser.end();

        let items: ParsedItem[] = [];
        parser.parsed.subscribe((value) => {
            items = value;
        })();

        expect(items.length).toBe(3);

        const [text1, action, text2] = items;
        expectAction(action);
        expectText(text1);
        expectText(text2);
        expect(text1.content).toBe('Text before ');
        expect(action.type).toBe('file');
        expect(action.src).toBe('test.js');
        expect(action.content).toBe('console.log("test");');
        expect(action.complete).toBe(true);
        expect(text2.content).toBe(' Text after');
    });

    it('should skip actions with invalid types', () => {
        const text = '<action type="invalid">Invalid content</action>';
        parser.chunk(text);
        parser.end();

        let items: ParsedItem[] = [];
        parser.parsed.subscribe((value) => {
            items = value;
        })();

        expect(items.length).toBe(0);
    });

    it('should trim newlines correctly from action content', () => {
        const text = '<action type="file" src="test.js">\nconsole.log("test");\n</action>';
        parser.chunk(text);
        parser.end();

        let items: ParsedItem[] = [];
        parser.parsed.subscribe((value) => {
            items = value;
        })();

        expect(items.length).toBe(1);

        const [item] = items;
        expect(item.content).toBe('console.log("test");');
    });

    it('should reset parser state correctly', () => {
        parser.chunk('Text before <action type="shell">npm install</action>');
        parser.reset();
        parser.chunk('New text');
        parser.end();

        let items: ParsedItem[] = [];
        parser.parsed.subscribe((value) => {
            items = value;
        })();

        expect(items.length).toBe(1);

        const [item] = items;
        expect(item.content).toBe('New text');
    });

    it('should parse a complex example correctly', () => {
        const complexExample = `
Thanks! I'll help you create a full-featured Todo app.

<action type="file" src=".env">
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=34534534534
</action>

<action type="shell">
npm install appwrite
</action>

Some text in between actions.

<action type="file" src="src/lib/appwrite.ts">
import { Client } from 'appwrite';
const client = new Client();
</action>
`;

        parser.chunk(complexExample);
        parser.end();

        let items: ParsedItem[] = [];
        parser.parsed.subscribe((value) => {
            items = value;
        })();

        expect(items.length).toBe(5);

        const [text1, action1, action2, text2, action3] = items;

        expectText(text1);
        expect(text1.content.trim()).toBe("Thanks! I'll help you create a full-featured Todo app.");

        expectAction(action1);
        expect(action1.type).toBe('file');
        expect(action1.src).toBe('.env');
        expect(action1.content).toBe(
            'APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1\nAPPWRITE_PROJECT_ID=34534534534'
        );

        expectAction(action2);
        expect(action2.type).toBe('shell');
        expect(action2.content).toBe('npm install appwrite');

        expectText(text2);
        expect(text2.content.trim()).toBe('Some text in between actions.');

        expectAction(action3);
        expect(action3.type).toBe('file');
        expect(action3.src).toBe('src/lib/appwrite.ts');
        expect(action3.content).toBe(
            "import { Client } from 'appwrite';\nconst client = new Client();"
        );
    });

    it('should handle nested HTML correctly', () => {
        const text =
            '<action type="file" src="component.tsx">function Component() { return <div>Hello</div>; }</action>';
        parser.chunk(text);
        parser.end();

        let items: ParsedItem[] = [];
        parser.parsed.subscribe((value) => {
            items = value;
        })();

        expect(items.length).toBe(1);

        const [item] = items;
        expectAction(item);
        expect(item.type).toBe('file');
        expect(item.content).toBe('function Component() { return <div>Hello</div>; }');
    });
});
