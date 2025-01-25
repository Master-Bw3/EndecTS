import { Option } from "prelude-ts";
import { SerializationContext } from "./SerializationContext";
import { Endec } from "./Endec";

export abstract class Serializer<T> {

    setupContext(ctx: SerializationContext): SerializationContext {
        return ctx;
    }

    abstract writeByte(ctx: SerializationContext, value: number): void;
    abstract writeShort(ctx: SerializationContext, value: number): void;
    abstract writeInt(ctx: SerializationContext, value: number): void;
    abstract writeLong(ctx: SerializationContext, value: number): void;
    abstract writeFloat(ctx: SerializationContext, value: number): void;
    abstract writeDouble(ctx: SerializationContext, value: number): void;

    abstract writeVarInt(ctx: SerializationContext, value: number): void;
    abstract writeVarLong(ctx: SerializationContext, value: number): void;

    abstract writeBoolean(ctx: SerializationContext, value: boolean): void;
    abstract writeString(ctx: SerializationContext, value: string): void;
    abstract writeBytes(ctx: SerializationContext, bytes: Array<number>): void;

    abstract writeOptional<V>(ctx: SerializationContext, endec: Endec<V>, optional: Option<V>): void;

    abstract sequence<E>(ctx: SerializationContext, elementEndec: Endec<E>, size: number): Serializer.Sequence<E>;
    abstract map<V>(ctx: SerializationContext, valueEndec: Endec<V>, size: number): Serializer.Map<V>;
    abstract struct(): Serializer.Struct;

    abstract getResult(): T;

    
}

export namespace Serializer {
    export interface Sequence<E> {
        element(element: E): void;
    }

    export interface Map<V> {
        entry(key: string, value: V): void;
    }

    export interface Struct {
        field<F>(name: string, ctx: SerializationContext, endec: Endec<F>, value: F, mayOmit: boolean): Struct;
    }
}