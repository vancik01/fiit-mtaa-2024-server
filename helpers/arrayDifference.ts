export function getArrayDifference<T>(
    oldItems: T[],
    newItems: T[]
): { added: T[]; removed: T[] } {
    const oldCatSet = new Set(oldItems || []);
    const newCatSet = new Set(newItems || []);

    newItems = !newItems ? [] : newItems;
    oldItems = !oldItems ? [] : oldItems;

    const added = newItems
        .filter((x) => !oldCatSet.has(x))
        .filter((x) => x !== "");
    const removed = oldItems
        .filter((x) => !newCatSet.has(x))
        .filter((x) => x !== "");

    return {
        added,
        removed
    };
}
