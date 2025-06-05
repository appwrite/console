/// <reference types="@sveltejs/kit" />
interface Window { }

namespace App {
    interface Error {
        type: string = 'unknown',
    }

    interface HandleClientError {
        message: string;
        status?: number;
        type: string;
    }
}