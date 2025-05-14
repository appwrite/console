import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
    createStreamParser,
    StreamParser,
    type ParsedItem,
    type Action,
    type TextChunk,
    type ActionsContainer
} from './parser';

function expectAction(item: ParsedItem): asserts item is Action {
    expect('type' in item && item.type !== 'actions').toBe(true);
}

function expectActionsContainer(item: ParsedItem): asserts item is ActionsContainer {
    expect('type' in item && item.type === 'actions').toBe(true);
}
function expectText(item: ParsedItem): asserts item is TextChunk {
    expect(!('type' in item) && 'content' in item).toBe(true);
}

describe('stream parser', () => {
    let parser: StreamParser;

    beforeEach(() => {
        parser = createStreamParser();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should group multiple actions from the same source in one container', () => {
        // This test checks the actions container grouping functionality
        // Add multiple actions in separate chunks
        parser.chunk('Text before', 'system');
        parser.chunk('<action type="file" src="file1.js">code1</action>', 'system');
        parser.chunk('<action type="shell">npm install</action>', 'system');
        parser.chunk('Text after', 'system');
        parser.end();

        let items: ParsedItem[] = [];
        parser.parsed.subscribe((value) => {
            items = value;
        })();

        expect(items.length).toBe(3);
        const [text1, container, text2] = items;

        expectText(text1);
        expectActionsContainer(container);
        expectText(text2);

        expect(text1.content).toBe('Text before');
        expect(text2.content).toBe('Text after');

        // Check that both actions are in the same container
        expect(container.actions.length).toBe(2);
        expect(container.actions[0].type).toBe('file');
        expect(container.actions[0].src).toBe('file1.js');
        expect(container.actions[0].content).toBe('code1');
        expect(container.actions[1].type).toBe('shell');
        expect(container.actions[1].content).toBe('npm install');
    });

    it('should parse text chunks correctly', () => {
        const text = 'Hello, world!';
        parser.chunk(text, 'system');
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
        parser.chunk(actionText, 'system');
        parser.end();

        let items: ParsedItem[] = [];
        parser.parsed.subscribe((value) => {
            items = value;
        })();

        expect(items.length).toBe(1);

        const [container] = items;
        expectActionsContainer(container);
        expect(container.actions.length).toBe(1);
        const action = container.actions[0];
        expect(action.type === 'file').toBe(true);
        expect(action.src).toBe('test.js');
        expect(action.content).toBe('console.log("test");');
        expect(action.complete).toBe(true);
    });

    it('should parse shell actions correctly', () => {
        const actionText = '<action type="shell">npm install</action>';
        parser.chunk(actionText, 'system');
        parser.end();

        let items: ParsedItem[] = [];
        parser.parsed.subscribe((value) => {
            items = value;
        })();

        expect(items.length).toBe(1);

        const [container] = items;
        expectActionsContainer(container);
        expect(container.actions.length).toBe(1);
        const action = container.actions[0];
        expect(action.type).toBe('shell');
        expect(action.content).toBe('npm install');
        expect(action.complete).toBe(true);
    });

    it('should handle mixed content correctly', () => {
        const text = 'Text before <action type="shell">npm install</action> Text after';
        parser.chunk(text, 'system');
        parser.end();

        let items: ParsedItem[] = [];
        parser.parsed.subscribe((value) => {
            items = value;
        })();

        expect(items.length).toBe(3);
        const [text1, container, text2] = items;
        expectActionsContainer(container);
        expectText(text1);
        expectText(text2);
        expect(text1.content).toBe('Text before ');
        expect(container.actions[0].type).toBe('shell');
        expect(container.actions[0].content).toBe('npm install');
        expect(text2.content).toBe(' Text after');
    });

    it('should handle chunked input correctly', () => {
        parser.chunk('Text before ', 'system');
        parser.chunk('<action type="file" ', 'system');
        parser.chunk('src="test.js">', 'system');
        parser.chunk('console.log', 'system');
        parser.chunk('("test");', 'system');
        parser.chunk('</action>', 'system');
        parser.chunk(' Text after', 'system');
        parser.end();

        let items: ParsedItem[] = [];
        parser.parsed.subscribe((value) => {
            items = value;
        })();

        expect(items.length).toBe(3);

        const [text1, container, text2] = items;
        expectActionsContainer(container);
        expectText(text1);
        expectText(text2);
        expect(text1.content).toBe('Text before ');
        expect(container.actions[0].type).toBe('file');
        expect(container.actions[0].src).toBe('test.js');
        expect(container.actions[0].content).toBe('console.log("test");');
        expect(container.actions[0].complete).toBe(true);
        expect(text2.content).toBe(' Text after');
    });

    it('should skip actions with invalid types', () => {
        const text = '<action type="invalid">Invalid content</action>';
        parser.chunk(text, 'system');
        parser.end();

        let items: ParsedItem[] = [];
        parser.parsed.subscribe((value) => {
            items = value;
        })();

        expect(items.length).toBe(0);
    });

    it('should trim newlines correctly from action content', () => {
        // This test verifies that only leading and trailing newlines are trimmed
        // but internal newlines are preserved
        const text =
            '<action type="file" src="test.js">\nconsole.log("test1");\nconsole.log("test2");\n</action>';
        parser.chunk(text, 'system');
        parser.end();

        let items: ParsedItem[] = [];
        parser.parsed.subscribe((value) => {
            items = value;
        })();

        expect(items.length).toBe(1);

        const [container] = items;
        expectActionsContainer(container);
        // The leading \n and trailing \n should be removed, but the middle \n should be preserved
        expect(container.actions[0].content).toBe('console.log("test1");\nconsole.log("test2");');
    });

    it('should reset parser state correctly', () => {
        parser.chunk('Text before <action type="shell">npm install</action>', 'system');
        parser.reset();
        parser.chunk('New text', 'system');
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
`;

        parser.chunk(complexExample, 'system');
        parser.end();

        let items: ParsedItem[] = [];
        parser.parsed.subscribe((value) => {
            items = value;
        })();

        expect(items.length).toBe(2);
        const [text, container] = items;

        expectText(text);
        expect(text.content.trim()).toBe("Thanks! I'll help you create a full-featured Todo app.");

        expectActionsContainer(container);
        const [action1, action2] = container.actions;
        expect(action1.type).toBe('file');
        expect(action1.src).toBe('.env');
        expect(action1.content).toBe(
            'APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1\nAPPWRITE_PROJECT_ID=34534534534'
        );
        expect(action2.type).toBe('shell');
        expect(action2.content).toBe('npm install appwrite');
    });

    it('should handle nested HTML correctly', () => {
        const text =
            '<action type="file" src="component.tsx">function Component() { return <div>Hello</div>; }</action>';
        parser.chunk(text, 'system');
        parser.end();

        let items: ParsedItem[] = [];
        parser.parsed.subscribe((value) => {
            items = value;
        })();

        expect(items.length).toBe(1);

        const [container] = items;
        expectActionsContainer(container);
        const action = container.actions[0];
        expect(action.type).toBe('file');
        expect(action.content).toBe('function Component() { return <div>Hello</div>; }');
    });

    it('should handle partially closed action tags correctly', () => {
        parser.chunk('<action type="file" src="test.js">console.log("test");</ac', 'system');
        parser.chunk('tion>', 'system');
        parser.end();

        let items: ParsedItem[] = [];
        parser.parsed.subscribe((value) => {
            items = value;
        })();

        expect(items.length).toBe(1);
        const [container] = items;
        expectActionsContainer(container);
        const action = container.actions[0];
        expect(action.complete).toBe(true);
        expect(action.content).toBe('console.log("test");');
    });

    it('should handle multiple adjacent actions without text between', () => {
        parser.chunk(
            '<action type="file" src="file1.js">code1</action><action type="file" src="file2.js">code2</action>',
            'system'
        );
        parser.end();

        let items: ParsedItem[] = [];
        parser.parsed.subscribe((value) => {
            items = value;
        })();

        expect(items.length).toBe(1);
        const [container] = items;
        expectActionsContainer(container);
        expect(container.actions.length).toBe(2);
        expect(container.actions[0].src).toBe('file1.js');
        expect(container.actions[0].content).toBe('code1');
        expect(container.actions[1].src).toBe('file2.js');
        expect(container.actions[1].content).toBe('code2');
    });

    it('should handle empty action content correctly', () => {
        parser.chunk('<action type="shell"></action>', 'system');
        parser.end();

        let items: ParsedItem[] = [];
        parser.parsed.subscribe((value) => {
            items = value;
        })();

        expect(items.length).toBe(1);
        const [container] = items;
        expectActionsContainer(container);
        const action = container.actions[0];
        expect(action.content).toBe(''); // Empty content should remain exactly empty
        expect(action.complete).toBe(true);
    });

    it('should filter out empty text chunks', () => {
        parser.chunk('  \n  <action type="shell">command</action>  \n  ', 'system');
        parser.end();

        let items: ParsedItem[] = [];
        parser.parsed.subscribe((value) => {
            items = value;
        })();

        // Only the action should remain, empty text chunks should be filtered
        expect(items.length).toBe(1);
        const [container] = items;
        expectActionsContainer(container);
        const action = container.actions[0];
        expect(action.content).toBe('command');
    });

    it('should handle malformed action tags gracefully', () => {
        parser.chunk('<action type="file" src="test.js" unclosed', 'system');
        parser.chunk('>content</action>', 'system');
        parser.end();

        let items: ParsedItem[] = [];
        parser.parsed.subscribe((value) => {
            items = value;
        })();

        expect(items.length).toBe(1);
        const [container] = items;
        expectActionsContainer(container);
        const action = container.actions[0];
        expect(action.content).toBe('content');
    });

    it('should handle large content streaming properly', () => {
        const largeText = 'A'.repeat(1000);
        parser.chunk('Text before ', 'system');
        parser.chunk('<action type="file" src="large.txt">', 'system');
        parser.chunk(largeText, 'system');
        parser.chunk('</action>', 'system');
        parser.end();

        let items: ParsedItem[] = [];
        parser.parsed.subscribe((value) => {
            items = value;
        })();

        expect(items.length).toBe(2);
        const [text, container] = items;
        expectText(text);
        expectActionsContainer(container);
        expect(container.actions[0].content.length).toBe(1000);
    });

    it('should handle end() call with incomplete action', () => {
        parser.chunk('<action type="file" src="test.js">content', 'system');
        // No closing tag, but end() is called
        parser.end();

        let items: ParsedItem[] = [];
        parser.parsed.subscribe((value) => {
            items = value;
        })();

        expect(items.length).toBe(1);
        const [container] = items;
        expectActionsContainer(container);
        const action = container.actions[0];
        expect(action.content).toBe('content');
        expect(action.complete).toBe(true);
    });

    it('should mark TextChunks as complete when end() is called', () => {
        parser.chunk('This is some text', 'system');
        parser.end();

        let items: ParsedItem[] = [];
        parser.parsed.subscribe((value) => {
            items = value;
        })();

        expect(items.length).toBe(1);
        const [item] = items;
        expectText(item);
        expect(item.content).toBe('This is some text');
        expect(item.complete).toBe(true);
    });

    it('should mark all TextChunks as complete when end() is called', () => {
        parser.chunk('First text chunk', 'system');
        parser.chunk('<action type="shell">command</action>', 'system');
        parser.chunk('Second text chunk', 'system');
        parser.end();

        let items: ParsedItem[] = [];
        parser.parsed.subscribe((value) => {
            items = value;
        })();

        expect(items.length).toBe(3);
        const [text1, container, text2] = items;
        expectText(text1);
        expectActionsContainer(container);
        expectText(text2);
        expect(text1.complete).toBe(true);
        expect(container.complete).toBe(true);
        expect(container.actions[0].complete).toBe(true);
        expect(text2.complete).toBe(true);
    });

    it('should separate chunks from different sources', () => {
        // Stream from system
        parser.chunk('System message', 'system');
        parser.end(); // Complete the system chunk

        // Stream from user
        parser.chunk('User message', 'user');
        parser.end();

        let items: ParsedItem[] = [];
        parser.parsed.subscribe((value) => {
            items = value;
        })();

        expect(items.length).toBe(2);
        const [systemChunk, userChunk] = items;

        expectText(systemChunk);
        expectText(userChunk);

        expect(systemChunk.from).toBe('system');
        expect(systemChunk.content).toBe('System message');
        expect(systemChunk.complete).toBe(true);

        expect(userChunk.from).toBe('user');
        expect(userChunk.content).toBe('User message');
        expect(userChunk.complete).toBe(true);
    });

    it('should create separate chunks when end() is called even with same source', () => {
        // First chunk
        parser.chunk('First part', 'system');
        parser.end();

        // Second chunk with same source
        parser.chunk('Second part', 'system');
        parser.end();

        let items: ParsedItem[] = [];
        parser.parsed.subscribe((value) => {
            items = value;
        })();

        expect(items.length).toBe(2);
        const [chunk1, chunk2] = items;

        expectText(chunk1);
        expectText(chunk2);

        expect(chunk1.from).toBe('system');
        expect(chunk1.content).toBe('First part');
        expect(chunk1.complete).toBe(true);

        expect(chunk2.from).toBe('system');
        expect(chunk2.content).toBe('Second part');
        expect(chunk2.complete).toBe(true);
    });

    it('should append text to chunk until end() is called', () => {
        // Stream in multiple parts to the same chunk
        parser.chunk('First part ', 'system');
        parser.chunk('Second part', 'system');
        parser.end();

        let items: ParsedItem[] = [];
        parser.parsed.subscribe((value) => {
            items = value;
        })();

        expect(items.length).toBe(1);
        const [chunk] = items;

        expectText(chunk);
        expect(chunk.from).toBe('system');
        expect(chunk.content).toBe('First part Second part');
        expect(chunk.complete).toBe(true);
    });
});
