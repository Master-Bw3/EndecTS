import { Deserializer } from "~/Deserializer";
import { Endec } from "~/Endec";
import { SerializationContext } from "~/SerializationContext";
import { Serializer } from "~/Serializer";

export class RecursiveEndec<T> extends Endec<T> {

    public endec: Endec<T>;

    public constructor(builder: (endec: Endec<T>) => Endec<T>) {
        super();
        this.endec = builder(this);
    }

    override encode(ctx: SerializationContext, serializer: Serializer<unknown>, value: T): void {
        this.endec.encode(ctx, serializer, value);
    }

    override decode(ctx: SerializationContext, deserializer: Deserializer<unknown>): T {
        return this.endec.decode(ctx, deserializer);
    }
}