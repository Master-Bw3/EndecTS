import { Deserializer } from "~/Deserializer";

export abstract class RecursiveDeserializer<T> extends Deserializer<T> {

    protected frames: Array<() => T> = [];
    protected serialized: T;

    protected constructor(serialized: T) {
        super();
        this.serialized = serialized;
        this.frames.push(() => this.serialized);
    }

    /**
     * Get the value currently to be decoded
     * <p>
     * This value is altered by {@link #frame(Supplier, Supplier)} and
     * initially returns the entire serialized input
     */
    protected getValue(): T {
        return this.frames[this.frames.length - 1]();
    }

    /**
     * Decode the next value down the tree, given by {@code nextValue}, by pushing that frame
     * onto the decoding stack, invoking {@code action}, and popping the frame again. Consequently,
     * all decoding of {@code nextValue} must happen inside {@code action}
     * <p>
     * If {@code nextValue} is reading the field of a struct, {@code isStructField} must be set
     */
    protected frame<V>(nextValue: () => T, action: () => V): V {
        try {
            this.frames.push(nextValue);
            return action();
        } finally {
            this.frames.pop();
        }
    }

    override tryRead<V>(reader: (deserializer: Deserializer<T>) => V): V {
        var framesBackup = [...this.frames];

        try {
            return reader(this);
        } catch (e) {
            this.frames.length = 0;
            this.frames.push(...framesBackup);

            throw e;
        }
    }

}

export namespace RecursiveDeserializer {
    export class Frame<T> {
        source: () => T
        isStructField: boolean

        constructor( source: () => T, isStructField: boolean) {
            this.source = source;
            this.isStructField = isStructField
        }
    }
}