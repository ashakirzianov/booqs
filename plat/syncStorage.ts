export function syncStorageCell<T>(key: string) {
    const storage = process.browser
        ? window.localStorage
        : undefined;
    function store(value: T) {
        storage?.setItem(key, JSON.stringify(value));
    }
    function update(value: Partial<T>) {
        const prev = restore();
        if (prev) {
            store({
                ...prev,
                ...value,
            });
        }
    }
    function restore(): T | undefined {
        const value = storage?.getItem(key);
        const parsed = value
            ? JSON.parse(value) : undefined;
        return parsed;
    }
    function clear() {
        storage?.removeItem(key);
    }
    return {
        store, update, restore, clear,
    };
}
