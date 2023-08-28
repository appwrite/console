export function getFormData<T extends Record<string, unknown> = Record<string, unknown>>(
    e: SubmitEvent
): T {
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const data = {};

    formData.forEach((value, key) => {
        data[key] = value;
    });

    // TODO: Add validation? Maybe with zod
    return data as T;
}
