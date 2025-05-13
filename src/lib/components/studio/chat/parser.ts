import { writable, type Readable } from 'svelte/store';

export type ActionType = 'file' | 'shell';

interface Base {
    id: symbol;
    from: 'user' | 'system' | 'error';
    content: string;
    complete: boolean;
}

export interface Action extends Base {
    type: ActionType;
    src?: string;
}

export interface TextChunk extends Base {}

export function isActionType(type: string): type is ActionType {
    return ['file', 'shell'].includes(type);
}

export type ParsedItem = Action | TextChunk;

export class StreamParser {
    private items: ParsedItem[] = [];
    private store = writable<ParsedItem[]>([]);
    private currentFrom: Base['from'] = 'system';
    private currentAction: Action | null = null;
    private currentTextChunk: TextChunk | null = null;
    private buffer = '';
    private isFirstActionContent = false;
    private skipCurrentAction = false;
    private pendingText = '';
    private callbacksEnabled = true;
    private callbacks: Record<'complete', Array<(action: Action) => void | Promise<void>>> = {
        complete: []
    };
    /**
     * The store of parsed items that can be subscribed to for reactivity
     */
    public parsed: Readable<ParsedItem[]> = this.store;

    constructor() {}

    private triggerCallbacks(event: keyof typeof this.callbacks, action: Action) {
        if (!this.callbacksEnabled) return;
        this.callbacks.complete.forEach((callback) => callback(action));
    }

    /**
     * Register a callback to be called when an action is completed
     * @param event The event to listen for ('complete')
     * @param callback Function to call when an action is completed
     */
    public on(event: 'complete', callback: (action: Action) => void | Promise<void>): void {
        this.callbacks[event].push(callback);
    }

    /**
     * Process a chunk of text from a specific source
     *
     * @param text The text chunk to process
     * @param from The source of the text ('system', 'user', or 'error')
     * @param options Additional options
     *   - silent: If true, callbacks won't be triggered for actions completed in this chunk
     */
    public chunk(
        text: string,
        from: Base['from'],
        options: { silent: boolean } = { silent: false }
    ): void {
        // If the source changes, complete the current text chunk
        if (this.currentFrom !== from) {
            if (this.currentTextChunk) {
                this.currentTextChunk.complete = true;
                this.updateStore();
                this.currentTextChunk = null;
            }
        }

        this.currentFrom = from;
        this.callbacksEnabled = !options.silent;
        this.buffer += text;
        this.parse();
        this.callbacksEnabled = true;
    }

    private parse(): void {
        let continueProcessing = true;

        while (continueProcessing && this.buffer.length > 0) {
            // If we're inside an action tag
            if (this.currentAction || this.skipCurrentAction) {
                const closeTagIndex = this.buffer.indexOf('</action>');

                if (closeTagIndex === -1) {
                    // We don't have a complete closing tag yet
                    // Check if we might have a partial closing tag at the end
                    let partialCloseTagLength = 0;
                    for (let i = 1; i <= Math.min(9, this.buffer.length); i++) {
                        const potentialPartial = this.buffer.substring(this.buffer.length - i);
                        if ('</action>'.startsWith(potentialPartial)) {
                            partialCloseTagLength = i;
                            break;
                        }
                    }

                    const safeLength = this.buffer.length - partialCloseTagLength;

                    if (!this.skipCurrentAction && this.currentAction && safeLength > 0) {
                        // Add content up to the safe point
                        let contentToAdd = this.buffer.substring(0, safeLength);

                        // Handle first line break in streaming context
                        if (this.isFirstActionContent && contentToAdd.startsWith('\n')) {
                            contentToAdd = contentToAdd.substring(1);
                            this.isFirstActionContent = false;
                        }

                        this.currentAction.content += contentToAdd;
                        this.updateStore();
                    }

                    // Keep the potential partial tag in the buffer
                    this.buffer = this.buffer.substring(safeLength);
                    continueProcessing = false;
                } else {
                    // We found the closing tag
                    if (!this.skipCurrentAction && this.currentAction) {
                        // Only process content if we're not skipping
                        let contentPart = this.buffer.substring(0, closeTagIndex);

                        // Handle first line break
                        if (this.isFirstActionContent && contentPart.startsWith('\n')) {
                            contentPart = contentPart.substring(1);
                            this.isFirstActionContent = false;
                        }

                        this.currentAction.content += contentPart;

                        if (this.currentAction.content.endsWith('\n')) {
                            this.currentAction.content = this.currentAction.content.substring(
                                0,
                                this.currentAction.content.length - 1
                            );
                        }

                        this.currentAction.complete = true;
                        this.triggerCallbacks('complete', this.currentAction);
                        this.updateStore();
                    }

                    // Move past the closing tag
                    this.buffer = this.buffer.substring(closeTagIndex + 9); // 9 is length of </action>
                    this.currentAction = null;
                    this.skipCurrentAction = false;

                    // If transitioning between actions, ensure any existing text chunk is completed
                    if (this.currentTextChunk) {
                        this.currentTextChunk.complete = true;
                        this.updateStore();
                        this.currentTextChunk = null;
                    }
                }
            } else {
                // Look for opening action tag
                const openTagIndex = this.buffer.indexOf('<action');

                if (openTagIndex === -1) {
                    // No opening tag found, check for potential partial opening tag
                    let partialOpenTagLength = 0;
                    for (let i = 1; i <= 7; i++) {
                        const potentialPartial = this.buffer.substring(this.buffer.length - i);
                        if ('<action'.startsWith(potentialPartial)) {
                            partialOpenTagLength = i;
                            break;
                        }
                    }

                    const safeLength = this.buffer.length - partialOpenTagLength;

                    if (safeLength > 0) {
                        // Process text up to the safe point
                        this.pendingText += this.buffer.substring(0, safeLength);
                        this.flushPendingText();
                    }

                    // Keep the potential partial tag in the buffer
                    this.buffer = this.buffer.substring(safeLength);
                    continueProcessing = false;
                } else {
                    // Found an opening tag

                    // Process text before the tag
                    if (openTagIndex > 0) {
                        this.pendingText += this.buffer.substring(0, openTagIndex);
                        this.flushPendingText();
                    }

                    // Find the end of the opening tag
                    const tagEndIndex = this.buffer.indexOf('>', openTagIndex);
                    if (tagEndIndex === -1) {
                        // Incomplete tag, wait for more data
                        // Keep everything from the start of the tag
                        if (openTagIndex > 0) {
                            this.buffer = this.buffer.substring(openTagIndex);
                        }
                        continueProcessing = false;
                    } else {
                        // Parse the tag attributes
                        const tagContent = this.buffer.substring(openTagIndex + 7, tagEndIndex);
                        const attributes = this.parseAttributes(tagContent);

                        const type = attributes.type;
                        if (isActionType(type)) {
                            // Complete the current text chunk if it exists before switching to an action
                            if (this.currentTextChunk) {
                                this.currentTextChunk.complete = true;
                                this.updateStore();
                                this.currentTextChunk = null;
                            }

                            this.currentAction = {
                                id: Symbol(),
                                from: this.currentFrom,
                                type,
                                src: attributes.src,
                                content: '',
                                complete: false
                            };

                            this.isFirstActionContent = true;
                            this.items.push(this.currentAction);
                            this.updateStore();
                        } else {
                            // Invalid action type, skip this action
                            this.skipCurrentAction = true;
                        }

                        // Move past the opening tag
                        this.buffer = this.buffer.substring(tagEndIndex + 1);
                    }
                }
            }
        }
    }

    private parseAttributes(attributeString: string): Record<string, string> {
        const attributes: Record<string, string> = {};
        const regex = /(\w+)=["']([^"']*)["']/g;
        let match: RegExpExecArray;

        while ((match = regex.exec(attributeString)) !== null) {
            attributes[match[1]] = match[2];
        }

        return attributes;
    }

    private flushPendingText(): void {
        if (this.pendingText) {
            this.addToTextChunk(this.pendingText);
            this.pendingText = '';
        }
    }

    /**
     * Reset the parser state back to its initial state
     */
    public reset(): void {
        this.items = [];
        this.callbacksEnabled = true;
        this.currentAction = null;
        this.currentTextChunk = null;
        this.isFirstActionContent = false;
        this.skipCurrentAction = false;
        this.buffer = '';
        this.pendingText = '';
        this.store.set([]);
    }

    private addToTextChunk(text: string): void {
        if (!text) return;

        if (this.currentTextChunk) {
            this.currentTextChunk.content += text;
        } else {
            this.currentTextChunk = {
                id: Symbol(),
                from: this.currentFrom,
                content: text,
                complete: false
            };
            this.items.push(this.currentTextChunk);
        }

        this.updateStore();
    }

    private updateStore(): void {
        // Filter out empty text chunks before updating the store
        const filteredItems = this.items.filter((item) => {
            if ('type' in item) return true; // Keep all actions
            return item.content.trim() !== ''; // Only keep non-empty text chunks
        });

        this.store.set([...filteredItems]);
    }

    /**
     * Finalizes the current chunks, marks them as complete, and
     * prepares for a new chunk on the next call to chunk().
     */
    public end(): void {
        // Flush any pending text
        this.flushPendingText();

        // Process any remaining buffer content
        if (this.buffer.length > 0) {
            // Check if the buffer might be a partial tag
            const isPartialOpenTag = '<action'.startsWith(this.buffer);
            const isPartialCloseTag = '</action>'.startsWith(this.buffer);

            if (!isPartialOpenTag && !isPartialCloseTag) {
                if (!this.skipCurrentAction && this.currentAction) {
                    let contentToAdd = this.buffer;

                    // Handle first line break if this is the first content
                    if (this.isFirstActionContent && contentToAdd.startsWith('\n')) {
                        contentToAdd = contentToAdd.substring(1);
                        this.isFirstActionContent = false;
                    }

                    this.currentAction.content += contentToAdd;
                    if (this.currentAction.content.endsWith('\n')) {
                        this.currentAction.content = this.currentAction.content.substring(
                            0,
                            this.currentAction.content.length - 1
                        );
                    }
                    this.currentAction.complete = true;
                    this.triggerCallbacks('complete', this.currentAction);
                } else {
                    this.addToTextChunk(this.buffer);
                }
            }
            this.buffer = '';
            this.updateStore();
        }

        // Clean up current action if needed
        if (this.currentAction && !this.skipCurrentAction) {
            if (this.currentAction.content.endsWith('\n')) {
                this.currentAction.content = this.currentAction.content.substring(
                    0,
                    this.currentAction.content.length - 1
                );
            }
            this.currentAction.complete = true;
            this.triggerCallbacks('complete', this.currentAction);
            this.updateStore();
        }

        // Mark the current text chunk as complete if it exists
        if (this.currentTextChunk) {
            this.currentTextChunk.complete = true;
            this.updateStore();
        }

        // Find and complete any unfinished text chunks
        for (const item of this.items) {
            if (!('type' in item) && !item.complete) {
                item.complete = true;
            }
        }
        this.updateStore();

        this.currentAction = null;
        this.skipCurrentAction = false;

        // Clear current text chunk reference to ensure a new one is created on next chunk() call
        this.currentTextChunk = null;
    }
}

export function createStreamParser() {
    return new StreamParser();
}
