function make<T>(supplier: () => T, consumer: (x: T) => void): T {
    let t = supplier();

    consumer(t);

    return t;
}

export { make };
