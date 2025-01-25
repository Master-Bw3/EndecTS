import { Deserializer } from './Deserializer';
import { Endec } from './Endec';
import { StructField } from './impl/StructField';
import { SerializationContext } from './SerializationContext';
import { Serializer } from './Serializer';

export abstract class StructEndec<T> extends Endec<T> {
    abstract encodeStruct(
        ctx: SerializationContext,
        serializer: Serializer<unknown>,
        struct: Serializer.Struct,
        value: T
    ): void;

    abstract decodeStruct(
        ctx: SerializationContext,
        deserializer: Deserializer<unknown>,
        struct: Deserializer.Struct
    ): T;

    /**
     * Static constructor for {@link StructEndec} for use when base use of such is desired, it is recommended that
     * you use {@link StructEndecBuilder} as encoding and decoding of data must be kept
     * in the same order with same field names used across both encoding and decoding or issues may arise for
     * formats that are not Self Describing.
     */
    static structEndecOf<T>(
        encoder: StructEndec.StructuredEncoder<T>,
        decoder: StructEndec.StructuredDecoder<T>
    ): StructEndec<T> {
        return new (class extends StructEndec<T> {
            encodeStruct(
                ctx: SerializationContext,
                serializer: Serializer<unknown>,
                struct: Serializer.Struct,
                value: T
            ): void {
                encoder(ctx, serializer, struct, value);
            }

            decodeStruct(
                ctx: SerializationContext,
                deserializer: Deserializer<unknown>,
                struct: Deserializer.Struct
            ): T {
                return decoder(ctx, deserializer, struct);
            }
        })();
    }

    override encode(ctx: SerializationContext, serializer: Serializer<unknown>, value: T): void {
        let struct = serializer.struct();
        this.encodeStruct(ctx, serializer, struct, value);
    }

    override decode(ctx: SerializationContext, deserializer: Deserializer<unknown>): T {
        return this.decodeStruct(ctx, deserializer, deserializer.struct());
    }

    flatFieldOf<S>(getter: (x: S) => T): StructField<S, T> {
        return new StructField.Flat(this, getter);
    }

    flatInheritedFieldOf<M extends T>(): StructField<M, T> {
        return new StructField.Flat(this, (m) => m);
    }

    override xmap<R>(to: (v: T) => R, from: (v: R) => T): StructEndec<R> {
        return StructEndec.structEndecOf(
            (ctx, serializer, struct, value) =>
                this.encodeStruct(ctx, serializer, struct, from(value)),
            (ctx, deserializer, struct) => to(this.decodeStruct(ctx, deserializer, struct))
        );
    }

    override xmapWithContext<R>(
        to: (ctx: SerializationContext, v: T) => R,
        from: (ctx: SerializationContext, v: R) => T
    ): StructEndec<R> {
        return StructEndec.structEndecOf(
            (ctx, serializer, struct, value) =>
                this.encodeStruct(ctx, serializer, struct, from(ctx, value)),
            (ctx, deserializer, struct) => to(ctx, this.decodeStruct(ctx, deserializer, struct))
        );
    }

    structuredCatchErrors(
        decodeOnError: StructEndec.StructuredDecoderWithError<T>
    ): StructEndec<T> {
        return StructEndec.structEndecOf(this.encodeStruct, (ctx, deserializer, struct) => {
            try {
                return deserializer.tryRead((deserializer1) =>
                    this.decodeStruct(ctx, deserializer1, struct)
                );
            } catch (e) {
                return decodeOnError(
                    ctx,
                    deserializer,
                    struct,
                    e instanceof Error ? e : new Error(`${e}`)
                );
            }
        });
    }

    override validate(validator: (v: T) => void): StructEndec<T> {
        return this.xmap(
            (t) => {
                validator(t);
                return t;
            },
            (t) => {
                validator(t);
                return t;
            }
        );
    }
}

export namespace StructEndec {
    export type StructuredEncoder<T> = (
        ctx: SerializationContext,
        serializer: Serializer<unknown>,
        struct: Serializer.Struct,
        value: T
    ) => void;

    export type StructuredDecoder<T> = (
        ctx: SerializationContext,
        deserializer: Deserializer<unknown>,
        struct: Deserializer.Struct
    ) => T;

    export type StructuredDecoderWithError<T> = (
        ctx: SerializationContext,
        deserializer: Deserializer<unknown>,
        struct: Deserializer.Struct,
        exception: Error
    ) => T;
}
