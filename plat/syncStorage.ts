export function syncStorageCell<T>(key: string) {
    const storage = process.browser
        ? window.localStorage
        : undefined;
    return {
        store(value: T) {
            storage?.setItem(key, JSON.stringify(value));
        },
        restore(): T | undefined {
            const value = storage?.getItem(key);
            const parsed = value
                ? JSON.parse(value) : undefined;
            return parsed;
        },
        clear() {
            storage?.removeItem(key);
        },
    };
}
