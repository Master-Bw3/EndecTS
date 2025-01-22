function make<T>(supplier: () => T, consumer: (x: T) => void): T {
    var t = supplier();

    consumer(t);

    return t;
}

export { make };
