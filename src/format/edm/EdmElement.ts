import { None, Option, Some } from "prelude-ts";
import { KeyedEndec } from "~/impl/KeyedEndec";
import { SerializationContext } from "~/SerializationContext";
import { BlockWriter } from "~/util/BlockWriter";
import { MapCarrier } from "~/util/MapCarrier";


export enum Type {
    I8,
    U8,
    I16,
    U16,
    I32,
    U32,
    I64,
    U64,
    F32,
    F64,

    BOOLEAN,
    STRING,
    BYTES,
    OPTIONAL,

    SEQUENCE,
    MAP,
}

export function formatTypeName(type: Type): String {
    return Type[type].toLowerCase();
}

export class EdmElement<T> {

    static EMPTY: EdmElement<Option<EdmElement<unknown>>> = new EdmElement(Option.none(), Type.OPTIONAL);

    private value: T;
    private type: Type;

    constructor(value: T, type: Type) {
        this.value = value;
        this.type = type;
    }

    getValue(): T {
        return this.value;
    }

    public cast<V>(): V {
        return this.value as unknown as V;
    }

    getType():Type {
        return this.type;
    }

    unwrap(): any {
        if (Array.isArray(this.value)) {
            return this.value.map(o => (o as EdmElement<unknown>).unwrap());
        } else if (this.value instanceof Map) {
            return new Map(Array.from(this.value).map(entry => [entry[0], (entry[1] as EdmElement<unknown>).unwrap()]));
        } else if (this.value instanceof Some || this.value instanceof None) {
            return this.value.map(o => (o as EdmElement<unknown>).unwrap());
        } else {
            return this.value;
        }
    }

    /**
     * Create a copy of this EDM element as an {@link EdmMap}, which
     * implements the {@link io.wispforest.endec.util.MapCarrier} interface
     */
    asMap(): EdmMap {
        if(this.type != Type.MAP) {
            throw new Error("Cannot cast EDM element of type " + this.type + " to MAP");
        }

        return new EdmMap(new Map(this.cast<Map<String, EdmElement<unknown>>>()));
    }

    equals(o: unknown): boolean {
        if (this === o) return true;
        if (!(o instanceof EdmElement)) return false;
        if (!this.value === (o.value)) return false;
        if (this.value instanceof EdmElement && o.value instanceof EdmElement && !this.value.equals(o.value)) return false;

        return this.type == o.type;
    }

    public toString(): String {
        return this.format(new BlockWriter()).buildResult();
    }

    format(formatter: BlockWriter): BlockWriter {
        switch (this.type) {
            case Type.BYTES:
              return formatter.writeBlock("bytes(", ")", (blockWriter) => {
                blockWriter.write(Buffer.from(this.cast<Uint8Array>()).toString("base64"));
              }, false);
      
            case Type.MAP:
            return formatter.writeBlock("map({", "})", (blockWriter) => {
                const map = this.cast<Map<String, EdmElement<unknown>>>();
                let idx = 0;
      
                map.forEach((value, key) => {
                  formatter.write(`"${key}": `);
                  // Assuming value has a format method:
                  value.format(formatter);
      
                  if (idx < map.size - 1) {
                    formatter.writeln(",");
                  }
      
                  idx++;
                });
              });
      
            case Type.SEQUENCE:
              return formatter.writeBlock("sequence([", "])", (blockWriter) => {
                const list = this.cast<Array<EdmElement<unknown>>>();
      
                for (let idx = 0; idx < list.length; idx++) {
                  list[idx].format(formatter);
                  if (idx < list.length - 1) formatter.writeln(",");
                }
              });
      
            case Type.OPTIONAL:
              return formatter.writeBlock("optional(", ")", (blockWriter) => {
                const optional = this.cast<Option<EdmElement<any>>>();
      
                if (optional.isSome()) {
                    optional.get().format(formatter)
                } else {
                    formatter.write("")
                }
              }, false);
      
            case Type.STRING:
              return formatter.writeBlock("string(\"", "\")", (blockWriter) => {
                blockWriter.write(String(this.value));
              }, false);
      
            default:
              return formatter.writeBlock(`${this.type}(`, ")", (blockWriter) => {
                blockWriter.write(String(this.value));
              }, false);
          }
        }

    static i8(value: number): EdmElement<number> {
        return new EdmElement(value, Type.I8);
    }

    static u8(value: number): EdmElement<number> {
        return new EdmElement(value, Type.U8);
    }

    static i16(value: number): EdmElement<number> {
        return new EdmElement(value, Type.I16);
    }

    static u16(value: number): EdmElement<number> {
        return new EdmElement(value, Type.U16);
    }

    static i32(value: number): EdmElement<number> {
        return new EdmElement(value, Type.I32);
    }

    static u32(value: number): EdmElement<number> {
        return new EdmElement(value, Type.U32);
    }

    static i64(value: number): EdmElement<number> {
        return new EdmElement(value, Type.I64);
    }

    static u64(value: number): EdmElement<number> {
        return new EdmElement(value, Type.U64);
    }

    static f32(value: number): EdmElement<number> {
        return new EdmElement(value, Type.F32);
    }

    static f64(value: number): EdmElement<number> {
        return new EdmElement(value, Type.F64);
    }

    static bool(value: boolean): EdmElement<boolean> {
        return new EdmElement(value, Type.BOOLEAN);
    }

    static string(value: string): EdmElement<string> {
        return new EdmElement(value, Type.STRING);
    }

    static bytes(value: Array<number>): EdmElement<Array<number>> {
        return new EdmElement(value, Type.BYTES);
    }

    static optional(value: EdmElement<unknown> | Option<EdmElement<unknown>>): EdmElement<Option<EdmElement<unknown>>> {
        if (value instanceof EdmElement) {
            return EdmElement.optional(Option.ofNullable(value)); 
        } else {
            if(value.isNone()) return EdmElement.EMPTY;

            return new EdmElement(value, Type.OPTIONAL);
        }
    }

    public static sequence(value: Array<EdmElement<unknown>>): EdmElement<Array<EdmElement<unknown>>>  {
        return new EdmElement([...value], Type.SEQUENCE);
    }

    public static map(value: Map<String, EdmElement<unknown>>): EdmElement<Map<String, EdmElement<unknown>>> {
        return new EdmElement(new Map(value), Type.MAP);
    }

    public static consumeMap(value: Map<String, EdmElement<unknown>>): EdmElement<Map<String, EdmElement<unknown>>> {
        return new EdmElement(new Map(), Type.MAP); // Hangry
    } 
}

export class EdmMap extends EdmElement<Map<String, EdmElement<unknown>>> implements MapCarrier {

    private map:  Map<String, EdmElement<unknown>>;

    constructor(map: Map<String, EdmElement<unknown>> ) {
        super(new Map(map), Type.MAP);
        this.map = map;
    }

    getWithErrors<T>(ctx: SerializationContext, key: KeyedEndec<T>): T {
        if (!this.has(key)) return key.defaultValue();
        return key.getEndec().decodeFully(ctx, EdmDeserializer.of, this.map.get(key.getKey()));
    }

    put<T>(ctx: SerializationContext, key: KeyedEndec<T>, value: T): void {
        this.map.set(key.getKey(), key.getEndec().encodeFully(ctx, EdmSerializer.of, value));
    }

    delete<T>(key: KeyedEndec<T>): void {
        this.map.delete(key.getKey());
    }

    has<T>(key: KeyedEndec<T>): boolean {
        return Array.from(this.map.keys()).includes(key.getKey());
    }

    get<T>(ctx: SerializationContext, key: KeyedEndec<T>): T {
        try {
            return this.getWithErrors(ctx, key);
        } catch (e) {
            return key.defaultValue();
        }
    }

    putIfNotNull<T>(ctx: SerializationContext, key: KeyedEndec<T>, value: T): void {
        if (value == null) return;
        this.put(ctx, key, value);
    }
    
    copy<T>(ctx: SerializationContext, key: KeyedEndec<T>, other: MapCarrier): void {
        other.put(ctx, key, this.get(ctx, key));
    }

    copyIfPresent<T>(ctx: SerializationContext, key: KeyedEndec<T>, other: MapCarrier): void {
        if (!this.has(key)) return;
        this.copy(ctx, key, other);    
    }

    mutate<T>(ctx: SerializationContext, key: KeyedEndec<T>, mutator: (x: T) => T): void {
        this.put(ctx, key, mutator(this.get(ctx, key)));
    }
}