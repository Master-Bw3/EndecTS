import { Serializer } from "~/Serializer";

interface EncodedValue<T> {
    set(value: T ): void;
    getValue(): T | null;
    wasEncoded(): boolean;
    require(name: string): T | null;
}

type FrameAction<T> = (encoded: EncodedValue<T>) => void;

export abstract class RecursiveSerializer<T> extends Serializer<T> {

    protected frames: Array<(x: T) => void> = [];
    protected result: T;

    protected constructor(initialResult: T) {
        super();
        this.result = initialResult;
        this.frames.push(t => this.result = t);
    }


    /**
     * Store {@code value} into the current encoding location
     * <p>
     * This location is altered by {@link #frame(FrameAction)} and
     * initially is just the serializer's result directly
     */
    protected consume(value: T): void {
        this.frames[this.frames.length  -1](value);
    }

    /**
     * Encode the next value down the tree by pushing a new frame
     * onto the encoding stack and invoking {@code action}
     * <p>
     * {@code action} receives {@code encoded}, which is where the next call
     * to {@link #consume(Object)} (which {@code action} must somehow cause) will
     * store the value and allow {@code action} to retrieve it using {@link EncodedValue#value()}
     * or, preferably, {@link EncodedValue#require(String)}
     */
    protected frame(action: FrameAction<T> ): void {
        const encoded = new RecursiveSerializer.EncodedValue<T>();

        this.frames.push(encoded.set);
        action(encoded);
        this.frames.pop();
    }

    override getResult(): T {
        return this.result;
    }



    protected static EncodedValue = class EncodedValue<T> implements EncodedValue<T> {
        private value: T | null = null;
        private encoded: boolean = false;

        set(value: T ): void {
            this.value = value;
            this.encoded = true;
        }

        getValue(): T | null {
            return this.value;
        }

        wasEncoded(): boolean {
            return this.encoded;
        }

        require(name: string): T | null {
            if (!this.encoded) throw new Error("Endec for " + name + " serialized nothing");
            return this.getValue();
        }
    }
}
