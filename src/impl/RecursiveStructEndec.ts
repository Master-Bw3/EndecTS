import { Deserializer } from "~/Deserializer";
import { SerializationContext } from "~/SerializationContext";
import { Serializer } from "~/Serializer";
import { StructEndec } from "~/StructEndec";

export class RecursiveStructEndec<T> extends StructEndec<T> {

    public structEndec: StructEndec<T>;

    public constructor(builder: (endec: StructEndec<T>) => StructEndec<T>) {
        super();
        this.structEndec = builder(this);
    }

    override encodeStruct(ctx: SerializationContext, serializer: Serializer<unknown>, struct: Serializer.Struct, value: T): void {
        this.structEndec.encodeStruct(ctx, serializer, struct, value);
    }

    override decodeStruct(ctx: SerializationContext, deserializer: Deserializer<unknown>, struct: Deserializer.Struct): T {
        return this.structEndec.decodeStruct(ctx, deserializer, struct);
    }
}