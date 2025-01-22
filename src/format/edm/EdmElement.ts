import { None, Option, Some } from "prelude-ts";


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

function formatTypeName(type: Type): String {
    return Type[type].toLowerCase();
}

class EdmElement<T> {

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
        return format(new BlockWriter()).buildResult();
    }

    format(formatter: BlockWriter): BlockWriter {
        switch (this.type) {
            case Type.BYTES:
              formatter.writeBlock("bytes(", ")", false, (blockWriter) => {
                blockWriter.write(Buffer.from(this.cast<Uint8Array>()).toString("base64"));
              });
              break;
      
            case Type.MAP:
              formatter.writeBlock("map({", "})", true, (blockWriter) => {
                const map = this.cast<MapType>();
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
              break;
      
            case Type.SEQUENCE:
              formatter.writeBlock("sequence([", "])", true, (blockWriter) => {
                const list = this.cast<ListType>();
      
                for (let idx = 0; idx < list.length; idx++) {
                  list[idx].format(formatter);
                  if (idx < list.length - 1) formatter.writeln(",");
                }
              });
              break;
      
            case Type.OPTIONAL:
              formatter.writeBlock("optional(", ")", false, (blockWriter) => {
                const optional = this.cast<Option<EdmElement<any>>>();
      
                if (optional.isSome()) {
                    optional.get().format(formatter)
                } else {
                    formatter.write("")
                }
              });
              break;
      
            case Type.STRING:
              formatter.writeBlock("string(\"", "\")", false, (blockWriter) => {
                blockWriter.write(String(this.value));
              });
              break;
      
            default:
              formatter.writeBlock(`${this.type}(`, ")", false, (blockWriter) => {
                blockWriter.write(String(this.value));
              });
              break;
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

    static bool(value: number): EdmElement<number> {
        return new EdmElement(value, Type.BOOLEAN);
    }

    static string(value: number): EdmElement<number> {
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
