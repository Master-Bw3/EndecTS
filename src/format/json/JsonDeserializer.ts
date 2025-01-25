import { Option, Stream } from "prelude-ts";
import { Deserializer } from "~/Deserializer";
import { Endec } from "~/Endec";
import { SelfDescribedDeSerializer } from "~/SelfDescribedDeserializer";
import { SerializationAttributes } from "~/SerializationAttributes";
import { SerializationContext } from "~/SerializationContext";
import { Serializer } from "~/Serializer";
import { RecursiveDeserializer } from "~/util/RecursiveDeserializer";
import { JsonEndec } from "./JsonEndec";

export class JsonDeserializer extends RecursiveDeserializer<unknown> implements SelfDescribedDeSerializer<unknown> {


    protected constructor(serialized: unknown) {
        super(serialized)
    }

    static of(serialized: unknown): JsonDeserializer {
        return new JsonDeserializer(serialized);
    }

    setupContext(ctx: SerializationContext): SerializationContext {
        return super.setupContext(ctx).withAttributes(SerializationAttributes.HUMAN_READABLE);
    }

    readValueOfType<T>(type: "string" | "number" | "boolean" | "array"): T {
        const value = this.getValue();
        if (type === "array" && Array.isArray(value)) {
            return value as T
        } else if (typeof value === type) {
            return value as T
        } else {
            throw new Error(`${value} is not of type ${type}`)
        }

    }

    readByte(ctx: SerializationContext): number {
        return this.readValueOfType("number");
    }

    readShort(ctx: SerializationContext): number {
        return this.readValueOfType("number");
    }
    readInt(ctx: SerializationContext): number {
        return this.readValueOfType("number");
    }
    readLong(ctx: SerializationContext): number {
        return this.readValueOfType("number");
    }
    readFloat(ctx: SerializationContext): number {
        return this.readValueOfType("number");
    }
    readDouble(ctx: SerializationContext): number {
        return this.readValueOfType("number");
    }
    readVarInt(ctx: SerializationContext): number {
        return this.readValueOfType("number");
    }
    readVarLong(ctx: SerializationContext): number {
        return this.readValueOfType("number");
    }
    readBoolean(ctx: SerializationContext): boolean {
        return this.readValueOfType("boolean");
    }
    readString(ctx: SerializationContext): string {
        return this.readValueOfType("string");
    }
    readBytes(ctx: SerializationContext): Array<number> {
        var array: Array<unknown> = this.readValueOfType("array");

        var result: Array<number> = new Array(array.length);
        for (let i = 0; i < array.length; i++) {
            const value = array[i]
            result[i] = typeof value === "number" ? value : (() => {throw new Error(`${value} is not of type number`)})();
        }

        return result;
    }

    readOptional<V>(ctx: SerializationContext, endec: Endec<V>): Option<V> {
        let value = this.getValue();
        return !(value === null)
                ? Option.of(endec.decode(ctx, this))
                : Option.none();    
            }

    sequence<E>(ctx: SerializationContext, elementEndec: Endec<E>): Deserializer.Sequence<E> {
        return new JsonDeserializer.Sequence(ctx, elementEndec, this.readValueOfType("array"), this);
    }

    map<V>(ctx: SerializationContext, valueEndec: Endec<V>): Deserializer.Map<V> {
        throw new Error("Method not implemented.");
    }
    struct(): Deserializer.Struct {
        throw new Error("Method not implemented.");
    }
    
    readAny<S>(ctx: SerializationContext, visitor: Serializer<S>): void {
        this.decodeValue(ctx, visitor, this.getValue());
    }

    private decodeValue<S>(ctx: SerializationContext, visitor: Serializer<S>, element: unknown): void {
        if (element === null) {
            visitor.writeOptional(ctx, JsonEndec.INSTANCE, Option.none());
        } else if (typeof element === "string") {
            visitor.writeString(ctx, element);
        } else if (typeof element === "boolean") {
            visitor.writeBoolean(ctx, element);
        } else if (typeof element === "number") {
            visitor.writeDouble(ctx, element)
        } else if (Array.isArray(element)) {
            const sequence = visitor.sequence(ctx, Endec.endecOf(this.decodeValue, (ctx1, deserializer) => null), element.length)
            element.forEach(sequence.element);
            
        } else if (typeof element == "object" ) {
            var map = visitor.map(ctx, Endec.endecOf(this.decodeValue, (ctx1, deserializer) => null), Object.keys(element).length)
            Object.entries(element).forEach(([k, v]) => map.entry(k, v));
            
        } else {
            throw new Error("Non-standard, unrecognized JsonElement implementation cannot be decoded");
        }
    }

    static Sequence = class Sequence<V> implements Deserializer.Sequence<V> {

        private ctx: SerializationContext;
        private valueEndec: Endec<V>;
        private elements: Array<unknown>;
        private size: number;
    
        private JsonDeserializerObj: JsonDeserializer;
    
    
        constructor(ctx: SerializationContext, valueEndec: Endec<V>, elements: Array<unknown>, JsonDeserializerObj: JsonDeserializer) {
            this.ctx = ctx;
            this.valueEndec = valueEndec;
    
            this.elements = elements;
            this.size = elements.length;
            this.JsonDeserializerObj = JsonDeserializerObj;
        }
    
        estimatedSize(): number {
            return this.size;
        }
    
    
        hasNext(): boolean {
            return this.elements.length !== 0;
        }
        
    
        next(): V {
            var element = this.elements.shift();
            return this.JsonDeserializerObj.frame(
                    () => element,
                    () => this.valueEndec.decode(this.ctx, this.JsonDeserializerObj)
            );
        }
    }

    static Map = class Map<V> implements Deserializer.Map<V> {

        private ctx: SerializationContext;
        private valueEndec: Endec<V>;
        private entries: Array<[string, unknown]>;
        private size: number;

        private JsonDeserializerObj: JsonDeserializer;


        private constructor(ctx: SerializationContext, valueEndec: Endec<V>, entries: Record<string, unknown>, JsonDeserializerObj: JsonDeserializer) {
            this.ctx = ctx;
            this.valueEndec = valueEndec;

            this.entries = Object.entries(entries);
            this.size = this.entries.length;

            this.JsonDeserializerObj = JsonDeserializerObj;
        }

        estimatedSize(): number {
            return this.size;
        }

        hasNext(): boolean {
            return this.entries.length > 0;
        }

        next(): [string, V] {
            const entry = this.entries.shift()!;
            return this.JsonDeserializerObj.frame(
                    () => entry[1],
                    () => [entry[0], this.valueEndec.decode(this.ctx, this.JsonDeserializerObj)]
            );
        }
    }

    static Struct = class Struct implements Deserializer.Struct {

        private object: Record<string, unknown>;
    
        private JsonDeserializerObj: JsonDeserializer;
    
    
        private constructor(object: Record<string, unknown>, JsonDeserializerObj: JsonDeserializer) {
            this.object = object;
            this.JsonDeserializerObj = JsonDeserializerObj;
        }
    
        field<F>(name: string, ctx: SerializationContext, endec: Endec<F>, defaultValueFactory: (() => F) | null): F | null {
            const element = this.object.hasOwnProperty(name)? this.object[name] : null;
            if (element === null) {
                if(defaultValueFactory === null) {
                    throw new Error("Field '" + name + "' was missing from serialized data, but no default value was provided");
                }
    
                return defaultValueFactory();
            }
            return this.JsonDeserializerObj.frame(
                    () => element,
                    () => endec.decode(ctx, this.JsonDeserializerObj)
            );
        }
    }

}





