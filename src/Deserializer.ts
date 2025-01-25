import { Option } from "prelude-ts";
import type { Endec } from "./endec";
import { SerializationContext } from "./SerializationContext";

export abstract class Deserializer<T> {

    setupContext(ctx: SerializationContext): SerializationContext {
        return ctx;
    }

    abstract readByte(ctx: SerializationContext): number;
    abstract readShort(ctx: SerializationContext): number;
    abstract readInt(ctx: SerializationContext): number;
    abstract readLong(ctx: SerializationContext): number;
    abstract readFloat(ctx: SerializationContext): number;
    abstract readDouble(ctx: SerializationContext): number;

    abstract readVarInt(ctx: SerializationContext): number;
    abstract readVarLong(ctx: SerializationContext): number;

    abstract readBoolean(ctx: SerializationContext): boolean;
    abstract readString(ctx: SerializationContext): string;
    abstract readBytes(ctx: SerializationContext): Array<number>;
    abstract readOptional<V>(ctx: SerializationContext, endec: Endec<V>): Option<V>;

    abstract sequence<E>(ctx: SerializationContext, elementEndec: Endec<E>): Deserializer.Sequence<E>;
    abstract map<V>(ctx: SerializationContext, valueEndec:  Endec<V>): Deserializer.Map<V>;
    abstract struct(): Deserializer.Struct;

    abstract tryRead<V>(reader: (deserializer: Deserializer<T>) => V): V;

    
}

export namespace Deserializer {
    export interface Sequence<E> {

        estimatedSize(): number;

        hasNext(): boolean;

        next(): E ;
    }

    export interface Map<E> {

        estimatedSize(): number;

        hasNext(): boolean;

        next(): [string, E];
    }

    export interface Struct {

        /**
         * Decode the value of field {@code name} using {@code endec}. If no
         * such field exists in the serialized data, then {@code defaultValue}
         * supplier result is used as the returned value
         */
        field<F>(name: string, ctx: SerializationContext, endec: Endec<F>, defaultValueFactory: (() => F) | null): F | null;
    }
}