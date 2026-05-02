import { parse } from '$lib/helpers/envfile';
import { describe, expect, it } from 'vitest';

describe('parse', () => {
    it('parses key-value pairs separated by equals signs', () => {
        expect(parse('APPWRITE_ENDPOINT=http://localhost/v1\nAPPWRITE_PROJECT=console')).toEqual({
            APPWRITE_ENDPOINT: 'http://localhost/v1',
            APPWRITE_PROJECT: 'console'
        });
    });

    it('parses key-value pairs separated by colons', () => {
        expect(parse('HOST: localhost\nPORT: 3000')).toEqual({
            HOST: 'localhost',
            PORT: '3000'
        });
    });

    it('trims whitespace around keys and values', () => {
        expect(parse(' PUBLIC_KEY = value \n SECRET_KEY : secret ')).toEqual({
            PUBLIC_KEY: 'value',
            SECRET_KEY: 'secret'
        });
    });

    it('removes single and double quotes from values', () => {
        expect(parse("NAME='Appwrite'\nMESSAGE=\"Hello world\"")).toEqual({
            NAME: 'Appwrite',
            MESSAGE: 'Hello world'
        });
    });

    it('keeps equals signs and colons inside values', () => {
        expect(parse('DATABASE_URL=mysql://user:pass@example.com/db\nTOKEN=abc=123')).toEqual({
            DATABASE_URL: 'mysql://user:pass@example.com/db',
            TOKEN: 'abc=123'
        });
    });

    it('ignores blank lines, comments, and malformed lines', () => {
        expect(parse('\n# comment\nKEY=value\nMALFORMED\n:missing-key\n')).toEqual({
            KEY: 'value'
        });
    });

    it('allows empty values', () => {
        expect(parse('EMPTY=\nBLANK:')).toEqual({
            EMPTY: '',
            BLANK: ''
        });
    });
});
