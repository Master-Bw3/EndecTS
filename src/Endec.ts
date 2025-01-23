import { KeyedEndec } from "./impl/KeyedEndec";
import { SerializationContext } from "./SerializationContext";
import { Option } from "prelude-ts";
``
export abstract class Endec<T> {

    /**
     * Write all data required to reconstruct {@code value} into {@code serializer}
     */
    abstract encode(ctx: SerializationContext, serializer: Serializer<unknown>, value: T): void;

    /**
     * Decode the data specified by {@link #encode(SerializationContext, Serializer, Object)} and reconstruct
     * the corresponding instance of {@code T}.
     * <p>
     * Endecs which intend to handle deserialization failure by decoding a different
     * structure on error, must wrap their initial reads in a call to {@link Deserializer#tryRead(Function)}
     * to ensure that deserializer state is restored for the subsequent attempt
     */
    abstract decode(ctx: SerializationContext, deserializer: Deserializer<unknown>): T ;

    // ---

    /**
     * Create a new serializer with result type {@code E}, call {@link #encode(SerializationContext, Serializer, Object)}
     * once for the provided {@code value} and return the serializer's {@linkplain Serializer#result() result}
     */
    encodeFully<E>(serializerConstructor: () => Serializer<E>, value: T, ctx: SerializationContext = SerializationContext.empty()): E {
        let serializer = serializerConstructor();
        this.encode(serializer.setupContext(ctx), serializer, value);

        return serializer.result();
    }

    /**
     * Create a new deserializer by calling {@code deserializerConstructor} with {@code value}
     * and return the result of {@link #decode(SerializationContext, Deserializer)}
     */
    decodeFully<E>(deserializerConstructor: (x: E) => Deserializer<E>, value: E, ctx: SerializationContext = SerializationContext.empty()): T {
        let deserializer = deserializerConstructor.apply(value);
        return this.decode(deserializer.setupContext(ctx), deserializer);
    }

    // --- Serializer Primitives ---

    static VOID: Endec<void> = Endec.of((ctx, serializer, unused) => {}, (ctx, deserializer) => null);

    static BOOLEAN: Endec<boolean>  = Endec.of((ctx, serializer, value) => serializer.writeBoolean(ctx, value), (ctx, deserializer) => deserializer.readBoolean(ctx));
    static BYTE: Endec<number>  = Endec.of((ctx, serializer, value) => serializer.writeByte(ctx, value), (ctx, deserializer) => deserializer.readByte(ctx));
    static SHORT: Endec<number>  = Endec.of((ctx, serializer, value) => serializer.writeShort(ctx, value), (ctx, deserializer) => deserializer.readShort(ctx));
    static INT: Endec<number>  = Endec.of((ctx, serializer, value) => serializer.writeInt(ctx, value), (ctx, deserializer) => deserializer.readInt(ctx));
    static VAR_INT: Endec<number>  = Endec.of((ctx, serializer, value) => serializer.writeletInt(ctx, value), (ctx, deserializer) => deserializer.readletInt(ctx));
    static LONG: Endec<number>  = Endec.of((ctx, serializer, value) => serializer.writeLong(ctx, value), (ctx, deserializer) => deserializer.readLong(ctx));
    static let_LONG: Endec<number>  = Endec.of((ctx, serializer, value) => serializer.writeletLong(ctx, value), (ctx, deserializer) => deserializer.readletLong(ctx));
    static FLOAT: Endec<number>  = Endec.of((ctx, serializer, value) => serializer.writeFloat(ctx, value), (ctx, deserializer) => deserializer.readFloat(ctx));
    static DOUBLE: Endec<number>  = Endec.of((ctx, serializer, value) => serializer.writeDouble(ctx, value), (ctx, deserializer) => deserializer.readDouble(ctx));
    static STRING: Endec<string>  = Endec.of((ctx, serializer, value) => serializer.writeString(ctx, value), (ctx, deserializer) => deserializer.readString(ctx));
    static BYTES: Endec<Array<number>>  = Endec.of((ctx, serializer, value) => serializer.writeBytes(ctx, value), (ctx, deserializer) => deserializer.readBytes(ctx));

    // --- Serializer compound types ---

    /**
     * Create a new endec which serializes a list of elements
     * serialized using this endec
     */
    listOf(): Endec<Array<T>>  {
        return Endec.of((ctx, serializer, list) => {
            try {
                let sequence = serializer.sequence(ctx, this, list.length)
                list.forEach(sequence.element);
            } catch (e) {}
        }, (ctx, deserializer) => {
            let sequenceState = deserializer.sequence(ctx, this);

            let list = new Array(sequenceState.estimatedSize());
            sequenceState.forEachRemaining(list.push);

            return list;
        });
    }

    /**
     * Create a new endec which serializes a map from string
     * keys to values serialized using this endec
     */
    mapOf(): Endec<Map<String, T>>  {
        return Endec.of((ctx, serializer, map) => {
            try {
                let mapState = serializer.map(ctx, this, map.size())
                map.forEach(mapState.entry);
            } catch (e) {}
        }, (ctx, deserializer) => {
            let mapState = deserializer.map(ctx, this);

            let map = new Map<String, T>(mapState.estimatedSize());
            mapState.forEachRemaining(entry => map.set(entry.getKey(), entry.getValue()));

            return map;
        });
    }

    /**
     * Create a new endec which serializes an optional value
     * serialized using this endec
     */
    optionalOf(): Endec<Option<T>> {
        return Endec.of(
                (ctx, serializer, value) => serializer.writeOptional(ctx, this, value),
                (ctx, deserializer) => deserializer.readOptional(ctx, this)
        );
    }

    // --- Constructors ---

    static of<T>(encoder: Encoder<T>, decoder: Decoder<T> ): Endec<T>  {
        return {
            encode(ctx: SerializationContext,  serializer: Serializer<unknown>, value: T): void {
                encoder.encode(ctx, serializer, value);
            },

            decode(ctx: SerializationContext, deserializer: Deserializer<unknown> ) {
                return decoder.decode(ctx, deserializer);
            }
        };
    }

    static recursive<T>(builderFunc: (x: Endec<T>) => Endec<T>): Endec<T> {
        return new RecursiveEndec(builderFunc);
    }

    static unit<T> (instance: () => T): StructEndec<T> {
        return StructEndec.of((ctx, serializer, struct, value) => {}, (ctx, deserializer, struct) => instance());
    }

    /**
     * Create a new endec which serializes a map from keys serialized using
     * {@code keyEndec} to values serialized using {@code valueEndec}.
     * <p>
     * Due to the endec data model only natively supporting maps
     * with string keys, the resulting endec's serialized representation
     * is a list of key-value pairs
     */
    static map<K, V> (keyEndec: Endec<K> , valueEndec: Endec<V> ): Endec<Map<K, V>>  {
        return StructEndecBuilder.of(
                keyEndec.fieldOf("k", ([k, v]: [K, V]) => k),
                valueEndec.fieldOf("v", ([k, v]: [K, V]) => v),
                (k: K, v: V) => [k, v]
        ).listOf().xmap(entries => new Map(entries), kvMap => Array.from(kvMap));
    }

    /**
     * Create a new endec which serializes a map from keys encoded as strings using
     * {@code keyToString} and decoded using {@code stringToKey} to values serialized
     * using {@code valueEndec}
     */
    static stringMap<K, V>(keyToString: (key: K) => string, stringToKey: (str: string) => K, valueEndec: Endec<V> ): Endec<Map<K, V>> {
        return Endec.of((ctx, serializer, map) => {
            try{
                let mapState = serializer.map(ctx, valueEndec, map.size())
                map.forEach((k, v) => mapState.entry(keyToString(k), v));
            } catch (e) {}
        }, (ctx, deserializer) => {
            let mapState = deserializer.map(ctx, valueEndec);

            let map = new Map<K, V>(mapState.estimatedSize());
            mapState.forEachRemaining(entry => map.set(stringToKey(entry.getKey()), entry.getValue()));

            return map;
        });
    }

    /**
     * Create a new endec which serializes the enum constants of {@code enumClass}
     * <p>
     * In a human-readable format, the endec serializes to the {@linkplain Enum#name() constant's name},
     * and to its {@linkplain Enum#ordinal() ordinal} otherwise
     */
    static forEnum<E>(enumClass: Record<string, E>): Endec<E> {
        return Endec.ifAttr(
                SerializationAttributes.HUMAN_READABLE,
                Endec.STRING.xmap((name: string) => enumClass[name], (value: E) => Object.keys(enumClass).find(key => enumClass[key] === value))
        ).orElse(
                Endec.VAR_INT.xmap((ordinal: number) => Object.values(enumClass)[ordinal], (value: E) => Object.values(enumClass).indexOf(value))
        );
    }

    // ---

    /**
     * Create a new struct-dispatch endec which serializes letiants of the struct {@code T}
     * <p>
     * To do this, it inserts an additional field given by {@code letiantKey} into the beginning of the
     * struct and writes the letiant identifier obtained from {@code instanceToletiant} into it
     * using {@code letiantEndec}. When decoding, this letiant identifier is read and the rest
     * of the struct decoded with the endec obtained from {@code letiantToEndec}
     * <p>
     * For example, assume there is some interface like this
     * <pre>{@code
     * public interface Herbert {
     *      Identifier id();
     *      ... more functionality here
     * }
     * }</pre>
     *
     * which is implemented by {@code Harald} and {@code Albrecht}, whose endecs we have
     * stored in a map:
     * <pre>{@code
     * public final class Harald implements Herbert {
     *      public static final StructEndec<Harald> = StructEndecBuilder.of(...);
     *
     *      private final int haraldOMeter;
     *      ...
     * }
     *
     * public final class Albrecht implements Herbert {
     *     public static final StructEndec<Harald> = StructEndecBuilder.of(...);
     *
     *     private final List<String> dadJokes;
     *      ...
     * }
     *
     * public static final Map<Identifier, StructEndec<? extends Herbert>> HERBERT_REGISTRY = Map.of(
     *      new Identifier("herbert", "harald"), Harald.ENDEC,
     *      new Identifier("herbert", "albrecht"), Albrecht.ENDEC
     * );
     * }</pre>
     *
     * We could then create an endec capable of serializing either {@code Harald} or {@code Albrecht} as follows:
     * <pre>{@code
     * Endec.dispatchedStruct(HERBERT_REGISTRY::get, Herbert::id, BuiltInEndecs.IDENTIFIER, "type")
     * }</pre>
     *
     * If we now encode an instance of {@code Albrecht} to JSON using this endec, we'll get the following result:
     * <pre>{@code
     * {
     *      "type": "herbert:albrecht",
     *      "dad_jokes": [
     *          "What does a sprinter eat before a race? Nothing, they fast!",
     *          "Why don't eggs tell jokes? They'd crack each other up."
     *      ]
     * }
     * }</pre>
     *
     * And similarly, the following data could be used for decoding an instance of {@code Harald}:
     * <pre>{@code
     * {
     *      "type": "herbert:harald",
     *      "harald_o_meter": 69
     * }
     * }</pre>
     */
    static dispatchedStruct<T, K>(letiantToEndec: (x: K) => StructEndec<T>, instanceToletiant: (x: T) => K, letiantEndec: Endec<K> , letiantKey: string):  StructEndec<T> {
        return {
            encodeStruct(ctx: SerializationContext, serializer: Serializer<unknown>, struct: Serializer.Struct, value: T) {
                let letiant = instanceToletiant.apply(value);
                struct.field(letiantKey, ctx, letiantEndec, letiant);

                ((letiantToEndec as StructEndec<T>).apply(letiant)).encodeStruct(ctx, serializer, struct, value);
            },

            decodeStruct(ctx: SerializationContext , deserializer: Deserializer<unknown> ,  struct: Deserializer.Struct) {
                let letiant = struct.field(letiantKey, ctx, letiantEndec);
                return letiantToEndec.apply(letiant).decodeStruct(ctx, deserializer, struct);
            }
        };
    }

    /**
     * Create a new dispatch endec which serializes letiants of {@code T}
     * <p>
     * Such an endec is conceptually similar to a struct-dispatch one created through {@link #dispatchedStruct(Function, Function, Endec, String)}
     * (check the documentation on that function for a complete usage example), but because this family of endecs does not
     * require {@code T} to be a struct, the letiant identifier field cannot be merged with the rest and is encoded separately
     */
    static dispatched<T, K> (letiantToEndec: (x: K) => Endec<T>, instanceToletiant: (x: T) => K, letiantEndec: Endec<K>): StructEndec<T> {
        return {
            encodeStruct(ctx: SerializationContext, serializer: Serializer<unknown>,  struct: Serializer.Struct, value: T) {
                let letiant = instanceToletiant.apply(value);
                struct.field("letiant", ctx, letiantEndec, letiant);

                //noinspection unchecked
                struct.field("instance", ctx, letiantToEndec.apply(letiant) as Endec<T>, value);
            },

           decodeStruct(ctx: SerializationContext, deserializer: Deserializer<unknown> ,  struct: Deserializer.Struct) {
                let letiant = struct.field("letiant", ctx, letiantEndec);
                return struct.field("instance", ctx, letiantToEndec.apply(letiant));
            }
        };
    }

    // ---

    static ifAttr<T> (attribute: SerializationAttribute, endec: Endec<T>): AttributeEndecBuilder<T>  {
        return new AttributeEndecBuilder(endec, attribute);
    }

    // --- Endec composition ---

    /**
     * Create a new endec which converts between instances of {@code T} and {@code R}
     * using {@code to} and {@code from} before encoding / after decoding
     */
    xmap<R>( to: (v: T) => R, from: (v: R) => T): Endec<R>  {
        const endecObj = this;
        return Endec.of(
                (ctx, serializer, value) => endecObj.encode(ctx, serializer, from(value)),
                (ctx, deserializer) => to(endecObj.decode(ctx, deserializer))
        );
    }

    /**
     * Create a new endec which converts between instances of {@code T} and {@code R}
     * using {@code to} and {@code from} before encoding / after decoding, optionally using
     * the current {@linkplain SerializationContext serialization context}
     */
    xmapWithContext<R>(to: (ctx: SerializationContext, v: T) => R,  from: (ctx: SerializationContext, v: R) => T): Endec<R> {
        const endecObj = this;
        return Endec.of(
                (ctx, serializer, value) => endecObj.encode(ctx, serializer, from(ctx, value)),
                (ctx, deserializer) => to(ctx, endecObj.decode(ctx, deserializer))
        );
    }

    /**
     * Create a new endec which runs {@code validator} (giving it the chance to throw on
     * an invalid value) before encoding / after decoding
     */
    validate(validator: (v: T) => void): Endec<T> {
        return this.xmap(t => {
            validator(t);
            return t;
        }, t => {
            validator(t);
            return t;
        });
    }

    static clampedMax(endec: Endec<number>, max: number): Endec<number> {
        return Endec.clamped(endec, null, max);
    }


    static rangedMax( endec: Endec<number>, max: number, throwError: boolean): Endec<number> {
        return Endec.ranged(endec, null, max, throwError);
    }

    static clampedMin(endec: Endec<number>, min: number): Endec<number> {
        return Endec.clamped(endec, min, null);
    }

    static rangedMin(endec: Endec<number>, min: number, throwError: boolean): Endec<number> {
        return Endec.ranged(endec, min, null, throwError);
    }

    static clamped(endec: Endec<number>, min: number | null, max: number | null): Endec<number> {
        return Endec.ranged(endec, min, max, false);
    }

    static ranged(endec: Endec<number>, min: number | null ,max: number | null , throwError: boolean): Endec<number> {
        let errorChecker = (n: number) => {
            // 1st check if the given min value exist and then compare similar to: [n < min]
            // 2nd check if the given min value exist and then compare similar to: [n > max]
            if (min != null && n < min) {
                if(throwError) throw new RangeNumberException(n, min, max);
                return min;
            } else if (max != null && n > max) {
                if(throwError) throw new RangeNumberException(n, min, max);
                return max;
            }
            return n;
        };

        return endec.xmap(errorChecker, errorChecker);
    }

    /**
     * Create a new endec which, if decoding using this endec's {@link #decode(SerializationContext, Deserializer)} fails,
     * instead tries to decode using {@code decodeOnError}
     */
    catchErrors(decodeOnError: DecoderWithError<T>): Endec<T>  {
        return Endec.of(this.encode, (ctx, deserializer) => {
            try {
                return deserializer.tryRead(deserializer1 => this.decode(ctx, deserializer1));
            } catch (e: Error) {
                return decodeOnError(ctx, deserializer, e);
            }
        });
    }

    /**
     * Create a new endec which serializes a set of elements
     * serialized using this endec as an xmapped list
     */
    setOf(): Endec<Set<T>> {
        return this.listOf().xmap((list) => new Set(list), Array.from);
    }

    /**
     * Create a new endec by wrapping {@link #optionalOf()} and mapping between
     * present optional &lt;-&gt; value and empty optional &lt;-&gt; null
     */
    nullableOf(): Endec<T | null> {
        return this.optionalOf().xmap(o => o.orElse(null), Option.ofNullable);
    }

    // --- Conversion ---

    /**
     * Create a new keyed endec which (de)serializes the entry
     * with key {@code key} into/from a {@link MapCarrier},
     * decoding to the result of invoking {@code defaultValueFactory} if the map does not contain such an entry
     * <p>
     * If {@code T} is of an immutable type, you almost always want to use {@link #keyed(String, Object)} instead
     */
    keyed(key: string, defaultValueFactory: () => T): KeyedEndec<T> {
        return new KeyedEndec<>(key, this, defaultValueFactory);
    }

    // ---

    structOf(name: string): StructEndec<T> {
        const EndecObj = this
        return StructEndec.of(
                (ctx, serializer, struct, value) => struct.field(name, ctx, EndecObj, value),
                (ctx, serializer, struct) => struct.field(name, ctx, EndecObj));
    }

    recursiveStruct(builderFunc: (x: StructEndec<T>) => StructEndec<T>): StructEndec<T> {
        return new RecursiveStructEndec(builderFunc);
    }

    fieldOf<S>(name: string,  getter: (x: S) => T): StructField<S, T> {
        return new StructField(name, this, getter);
    }

    optionalFieldOf<S>(name: string,  getter: (x: S) => T, defaultValue: T | null): StructField<S, T> {
        return new StructField(name, this.optionalOf().xmap(optional => optional.orElse(defaultValue), Optional::ofNullable), getter, defaultValue);
    }

    optionalFieldOfLazy<S>(name: string,  getter: (x: S) => T, defaultValue: () => T): StructField<S, T> {
        return new StructField(name, this.optionalOf().xmap(optional => optional.getOrCall(defaultValue), Option.ofNullable), getter, defaultValue);
    }


}

export type Encoder<T> = (ctx: SerializationContext, serializer: Serializer<unknown>, value: T) => void

export type Decoder<T> = (ctx: SerializationContext, deserializer: Deserializer<unknown>) => T

export type  DecoderWithError<T> = (ctx: SerializationContext, deserializer: Deserializer<unknown>, exception: Error) => T