type CellValue<T> = {
    value: T,
    version: string | undefined,
};
export function syncStorageCell<T>(key: string, version?: string) {
    const storage = process.browser
        ? window.localStorage
        : undefined;
    function store(value: T) {
        const cellValue = {
            value, version,
        };
        storage?.setItem(key, JSON.stringify(cellValue));
    }
    function restore(): T | undefined {
        try {
            const value = storage?.getItem(key);
            const parsed = value
                ? JSON.parse(value) as CellValue<T>
                : undefined;
            if (version === parsed?.version) {
                return parsed?.value;
            } else {
                return undefined;
            }
        } catch {
            return undefined;
        }
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
    function clear() {
        storage?.removeItem(key);
    }
    return {
        store, update, restore, clear,
    };
}
