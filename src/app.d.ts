declare global {
    namespace App {
        interface Error {
            code: string;
            type: string;
        }
    }
}

export {};
