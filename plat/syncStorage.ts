export function syncStorage() {
    const storage = process.browser
        ? window.localStorage
        : undefined;
    return {
        store<T>(key: string, value: T) {
            storage?.setItem(key, JSON.stringify(value));
        },
        restore<T>(key: string): T | undefined {
            const value = storage?.getItem(key);
            const parsed = value
                ? JSON.parse(value) : undefined;
            return parsed;
        },
        clear(key: string) {
            storage?.removeItem(key);
        },
    };
}
