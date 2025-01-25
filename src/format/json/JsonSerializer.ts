import { Option } from "prelude-ts";
import { Endec } from "~/Endec";
import { SelfDescribedSerializer } from "~/SelfDescribedSerializer";
import { SerializationAttributes } from "~/SerializationAttributes";
import { SerializationContext } from "~/SerializationContext";
import { Serializer } from "~/Serializer";
import { RecursiveSerializer } from "~/util/RecursiveSerializer";


export class JsonSerializer extends RecursiveSerializer<unknown> implements SelfDescribedSerializer<unknown> {
    discriminator: "SelfDescribedSerializer" = "SelfDescribedSerializer";

    prefix: unknown

    protected constructor(prefix: unknown) {
        super(null);
        this.prefix = prefix;
    }

    static of(prefix: unknown = null): JsonSerializer {
        return new JsonSerializer(prefix)
    }

    override setupContext(ctx: SerializationContext): SerializationContext {
        return super.setupContext(ctx).withAttributes(SerializationAttributes.HUMAN_READABLE)
    }

    writeByte(ctx: SerializationContext, value: number): void {
        this.consume(value)
    }
    writeShort(ctx: SerializationContext, value: number): void {
        this.consume(value)
    }
    writeInt(ctx: SerializationContext, value: number): void {
        this.consume(value)
    }
    writeLong(ctx: SerializationContext, value: number): void {
        this.consume(value)
    }
    writeFloat(ctx: SerializationContext, value: number): void {
        this.consume(value)
    }
    writeDouble(ctx: SerializationContext, value: number): void {
        this.consume(value)
    }
    writeVarInt(ctx: SerializationContext, value: number): void {
        this.consume(value)
    }
    writeVarLong(ctx: SerializationContext, value: number): void {
        this.consume(value)
    }
    writeBoolean(ctx: SerializationContext, value: boolean): void {
        this.consume(value)
    }
    writeString(ctx: SerializationContext, value: string): void {
        this.consume(value)
    }
    writeBytes(ctx: SerializationContext, bytes: Array<number>): void {
        this.consume(bytes)
    }
    writeOptional<V>(ctx: SerializationContext, endec: Endec<V>, optional: Option<V>): void {
        if (optional.isSome()) {
            endec.encode(ctx, this, optional.get())
        } else {
            this.consume(null)
        }
    }
    sequence<E>(ctx: SerializationContext, elementEndec: Endec<E>, size: number): Serializer.Sequence<E> {
        throw new Error("Method not implemented.");
    }
    map<V>(ctx: SerializationContext, valueEndec: Endec<V>, size: number): Serializer.Map<V> {
        throw new Error("Method not implemented.");
    }
    struct(): Serializer.Struct {
        throw new Error("Method not implemented.");
    }

    static Sequence = class Sequence<V> implements Serializer.Sequence<V> {

        private ctx: SerializationContext;
        private valueEndec: Endec<V>;
        private result: Array<unknown>;
    
        private JsonSerializerObj: JsonSerializer;
    
    
        constructor(ctx: SerializationContext, valueEndec: Endec<V>, size: number, JsonSerializerObj: JsonSerializer) {
            this.ctx = ctx;
            this.valueEndec = valueEndec;
            this.JsonSerializerObj = JsonSerializerObj;


            if (this.JsonSerializerObj.prefix != null) {
                if (Array.isArray(this.JsonSerializerObj.prefix)) {
                    this.result = this.JsonSerializerObj.prefix;
                    this.JsonSerializerObj.prefix = null;
                } else {
                    throw new Error("Incompatible prefix of type " + this.JsonSerializerObj.prefix.constructor.name + " used for JSON sequence");
                }
            } else {
                this.result = new Array(size);
            }
        }

        element(element: V): void {
            this.JsonSerializerObj.frame(encoded => {
                this.valueEndec.encode(this.ctx, this.JsonSerializerObj, element);
                this.result.push(encoded.require("sequence element"));
            });
        }
        
    }

    static Map = class Map<V> implements Serializer.Map<V> {

        private ctx: SerializationContext;
        private valueEndec: Endec<V>;
        private result: Record<string, unknown>;


        private JsonSerializerObj: JsonSerializer;
        

        private constructor(ctx: SerializationContext, valueEndec: Endec<V>, JsonSerializerObj: JsonSerializer) {
            this.ctx = ctx;
            this.valueEndec = valueEndec;
            this.JsonSerializerObj = JsonSerializerObj;

        
            if (this.JsonSerializerObj.prefix != null) {
                if (typeof this.JsonSerializerObj.prefix === "object") {
                    this.result = this.JsonSerializerObj.prefix as Record<string, unknown>;
                    this.JsonSerializerObj.prefix = null;
                } else {
                    throw new Error("Incompatible prefix of type " + this.JsonSerializerObj.prefix.constructor.name + " used for JSON map/struct");
                }
            } else {
                this.result = {};
            }
        }
        
        entry(key: string, value: V): void {
            this.JsonSerializerObj.frame(encoded => {
                this.valueEndec.encode(this.ctx, this.JsonSerializerObj, value);
                this.result[key] = encoded.require("map value");
            });
        }
    }
    
}