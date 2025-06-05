/// <reference types="@sveltejs/kit" />
interface Window { }

namespace App {
    interface Error {
        type: string = 'unknown',
        resource: string = 'project',
    }
}