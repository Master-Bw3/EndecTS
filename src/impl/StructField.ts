import { Deserializer } from "~/Deserializer";
import { Endec } from "~/Endec";
import { SerializationContext } from "~/SerializationContext";
import { Serializer } from "~/Serializer";
import { StructEndec } from "~/StructEndec";

export class StructField<S, F> {

    protected name: string;
    protected endec: Endec<F>;
    protected getter: (x: S) => F;
    protected defaultValueFactory: null | (() => F);

    constructor(name: string, endec: Endec<F>, getter: (x: S) => F, defaultValueFactory: null | (() => F) = null) {
        this.name = name;
        this.endec = endec;
        this.getter = getter;
        this.defaultValueFactory = defaultValueFactory;
    }

    encodeField(ctx: SerializationContext, serializer: Serializer<unknown>, struct: Serializer.Struct, instance: S): void {
        try {
            struct.field(this.name, ctx, this.endec, this.getter(instance), this.defaultValueFactory != null);
        } catch (e) {
            throw new StructField.StructFieldException("Exception occurred when encoding a given StructField: [Field: " + this.name + "]", e);
        }
    }

    decodeField(ctx: SerializationContext, deserializer: Deserializer<unknown>, struct: Deserializer.Struct): F {
        try {
            return struct.field(this.name, ctx, this.endec, this.defaultValueFactory)!;
        } catch (e) {
            throw new StructField.StructFieldException("Exception occurred when decoding a given StructField: [Field: " + this.name + "]", e);
        }
    }
}

export namespace StructField {
    export class Flat<S, F> extends StructField<S, F> {

        constructor(endec: StructEndec<F>, getter: (x: S) => F) {
            super("", endec, getter, null);
        }

        private getEndec(): StructEndec<F> {
            return this.endec as StructEndec<F>;
        }

        override encodeField(ctx: SerializationContext, serializer: Serializer<unknown>, struct: Serializer.Struct, instance: S): void {
            this.getEndec().encodeStruct(ctx, serializer, struct, this.getter(instance));
        }

        override decodeField(ctx: SerializationContext, deserializer: Deserializer<unknown>, struct: Deserializer.Struct): F {
            return this.getEndec().decodeStruct(ctx, deserializer, struct);
        }
    }

    export class StructFieldException extends Error {
        constructor(message: string, cause: unknown) {
            super(`${message}\n- ${cause}`);
        }
    }
}