import { KeyedEndec } from './impl/KeyedEndec';
import { SerializationContext } from './SerializationContext';
import { Option } from 'prelude-ts';
import { StructEndec } from './StructEndec';
import { Serializer } from './Serializer';
import { Deserializer } from './Deserializer';
import { SerializationAttribute } from './SerializationAttribute';
import { StructField } from './impl/StructField';
import { StructEndecBuilder } from './impl/StructEndecBuilder';
import { AttributeEndecBuilder } from './impl/AttributeEndecBuilder';
import { SerializationAttributes } from './SerializationAttributes';
import { RecursiveEndec } from './impl/RecursiveEndec';
import { RecursiveStructEndec } from './impl/RecursiveStructEndec';

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
    abstract decode(ctx: SerializationContext, deserializer: Deserializer<unknown>): T;

    // ---

    /**
     * Create a new serializer with result type {@code E}, call {@link #encode(SerializationContext, Serializer, Object)}
     * once for the provided {@code value} and return the serializer's {@linkplain Serializer#result() result}
     */
    encodeFully<E>(
        serializerConstructor: () => Serializer<E>,
        value: T,
        ctx: SerializationContext = SerializationContext.empty()
    ): E {
        let serializer = serializerConstructor();
        this.encode(serializer.setupContext(ctx), serializer, value);

        return serializer.getResult();
    }

    /**
     * Create a new deserializer by calling {@code deserializerConstructor} with {@code value}
     * and return the result of {@link #decode(SerializationContext, Deserializer)}
     */
    decodeFully<E>(
        deserializerConstructor: (x: E) => Deserializer<E>,
        value: E,
        ctx: SerializationContext = SerializationContext.empty()
    ): T {
        let deserializer = deserializerConstructor(value);
        return this.decode(deserializer.setupContext(ctx), deserializer);
    }

    // --- Serializer Primitives ---

    static VOID: Endec<void> = Endec.endecOf(
        (_ctx, _serializer, _unused) => {},
        (ctx, deserializer) => null
    );

    static BOOLEAN: Endec<boolean> = Endec.endecOf(
        (ctx, serializer, value) => serializer.writeBoolean(ctx, value),
        (ctx, deserializer) => deserializer.readBoolean(ctx)
    );
    static BYTE: Endec<number> = Endec.endecOf(
        (ctx, serializer, value) => serializer.writeByte(ctx, value),
        (ctx, deserializer) => deserializer.readByte(ctx)
    );
    static SHORT: Endec<number> = Endec.endecOf(
        (ctx, serializer, value) => serializer.writeShort(ctx, value),
        (ctx, deserializer) => deserializer.readShort(ctx)
    );
    static INT: Endec<number> = Endec.endecOf(
        (ctx, serializer, value) => serializer.writeInt(ctx, value),
        (ctx, deserializer) => deserializer.readInt(ctx)
    );
    static VAR_INT: Endec<number> = Endec.endecOf(
        (ctx, serializer, value) => serializer.writeVarInt(ctx, value),
        (ctx, deserializer) => deserializer.readVarInt(ctx)
    );
    static LONG: Endec<number> = Endec.endecOf(
        (ctx, serializer, value) => serializer.writeLong(ctx, value),
        (ctx, deserializer) => deserializer.readLong(ctx)
    );
    static let_LONG: Endec<number> = Endec.endecOf(
        (ctx, serializer, value) => serializer.writeVarLong(ctx, value),
        (ctx, deserializer) => deserializer.readVarLong(ctx)
    );
    static FLOAT: Endec<number> = Endec.endecOf(
        (ctx, serializer, value) => serializer.writeFloat(ctx, value),
        (ctx, deserializer) => deserializer.readFloat(ctx)
    );
    static DOUBLE: Endec<number> = Endec.endecOf(
        (ctx, serializer, value) => serializer.writeDouble(ctx, value),
        (ctx, deserializer) => deserializer.readDouble(ctx)
    );
    static STRING: Endec<string> = Endec.endecOf(
        (ctx, serializer, value) => serializer.writeString(ctx, value),
        (ctx, deserializer) => deserializer.readString(ctx)
    );
    static BYTES: Endec<Array<number>> = Endec.endecOf(
        (ctx, serializer, value) => serializer.writeBytes(ctx, value),
        (ctx, deserializer) => deserializer.readBytes(ctx)
    );

    // --- Serializer compound types ---

    /**
     * Create a new endec which serializes a list of elements
     * serialized using this endec
     */
    listOf(): Endec<Array<T>> {
        return Endec.endecOf(
            (ctx, serializer, list) => {
                let sequence = serializer.sequence(ctx, this, list.length);
                list.forEach(sequence.element);
            },
            (ctx, deserializer) => {
                let sequenceState = deserializer.sequence(ctx, this);
                let list = new Array(sequenceState.estimatedSize());

                let result = sequenceState.next();
                while (sequenceState.hasNext) {
                    list.push(result);
                    result = sequenceState.next();
                }

                return list;
            }
        );
    }

    /**
     * Create a new endec which serializes a map from string
     * keys to values serialized using this endec
     */
    mapOf(): Endec<Map<string, T>> {
        return Endec.endecOf(
            (ctx, serializer, map) => {
                let mapState = serializer.map(ctx, this, map.keys.length);
                map.forEach((v, k) => mapState.entry(k, v));
            },
            (ctx, deserializer) => {
                let mapState = deserializer.map(ctx, this);

                let map = new Map<string, T>();

                let result = mapState.next();
                while (mapState.hasNext()) {
                    map.set(result[0], result[1]);
                    result = mapState.next();
                }

                return map;
            }
        );
    }

    /**
     * Create a new endec which serializes an optional value
     * serialized using this endec
     */
    optionalOf(): Endec<Option<T>> {
        return Endec.endecOf(
            (ctx, serializer, value) => serializer.writeOptional(ctx, this, value),
            (ctx, deserializer) => deserializer.readOptional(ctx, this)
        );
    }

    // --- Constructors ---

    static endecOf<T>(encoder: Endec.Encoder<T>, decoder: Endec.Decoder<T>): Endec<T> {
        return new (class extends Endec<T> {
            encode(ctx: SerializationContext, serializer: Serializer<unknown>, value: T): void {
                encoder(ctx, serializer, value);
            }

            decode(ctx: SerializationContext, deserializer: Deserializer<unknown>) {
                return decoder(ctx, deserializer);
            }
        })();
    }

    static recursive<T>(builderFunc: (x: Endec<T>) => Endec<T>): Endec<T> {
        return new RecursiveEndec(builderFunc);
    }

    static unit<T>(instance: () => T): StructEndec<T> {
        return StructEndec.structEndecOf(
            (ctx, serializer, struct, value) => {},
            (ctx, deserializer, struct) => instance()
        );
    }

    /**
     * Create a new endec which serializes a map from keys serialized using
     * {@code keyEndec} to values serialized using {@code valueEndec}.
     * <p>
     * Due to the endec data model only natively supporting maps
     * with string keys, the resulting endec's serialized representation
     * is a list of key-value pairs
     */
    static map<K, V>(keyEndec: Endec<K>, valueEndec: Endec<V>): Endec<Map<K, V>> {
        return StructEndecBuilder.of2(
            keyEndec.fieldOf('k', ([k, v]: [K, V]) => k),
            valueEndec.fieldOf('v', ([k, v]: [K, V]) => v),
            (k: K, v: V): [K, V] => [k, v]
        )
            .listOf()
            .xmap(
                (entries) => new Map(entries),
                (kvMap) => Array.from(kvMap)
            );
    }

    /**
     * Create a new endec which serializes a map from keys encoded as strings using
     * {@code keyToString} and decoded using {@code stringToKey} to values serialized
     * using {@code valueEndec}
     */
    static stringMap<K, V>(
        keyToString: (key: K) => string,
        stringToKey: (str: string) => K,
        valueEndec: Endec<V>
    ): Endec<Map<K, V>> {
        return Endec.endecOf(
            (ctx, serializer, map) => {
                let mapState = serializer.map(ctx, valueEndec, map.keys.length);
                map.forEach((v, k) => mapState.entry(keyToString(k), v));
            },
            (ctx, deserializer) => {
                let mapState = deserializer.map(ctx, valueEndec);

                let map = new Map<K, V>();
                let result = mapState.next();
                while (mapState.hasNext()) {
                    map.set(stringToKey(result[0]), result[1]);
                    result = mapState.next();
                }

                return map;
            }
        );
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
            Endec.STRING.xmap(
                (name: string) => enumClass[name],
                (value: E) => Object.keys(enumClass).find((key) => enumClass[key] === value)!
            )
        ).orElse(
            Endec.VAR_INT.xmap(
                (ordinal: number) => Object.values(enumClass)[ordinal],
                (value: E) => Object.values(enumClass).indexOf(value)
            )
        );
    }

    // ---

    /**
     * Create a new struct-dispatch endec which serializes variants of the struct {@code T}
     * <p>
     * To do this, it inserts an additional field given by {@code variantKey} into the beginning of the
     * struct and writes the variant identifier obtained from {@code instanceToVariant} into it
     * using {@code variantEndec}. When decoding, this variant identifier is read and the rest
     * of the struct decoded with the endec obtained from {@code variantToEndec}
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
     *     private final List<string> dadJokes;
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
    static dispatchedStruct<T, K>(
        variantToEndec: (x: K | null) => StructEndec<T>,
        instanceToVariant: (x: T) => K,
        variantEndec: Endec<K>,
        variantKey: string
    ): StructEndec<T> {
        return new (class extends StructEndec<T> {
            encodeStruct(
                ctx: SerializationContext,
                serializer: Serializer<unknown>,
                struct: Serializer.Struct,
                value: T
            ) {
                let variant = instanceToVariant(value);
                struct.field(variantKey, ctx, variantEndec, variant, false);

                variantToEndec(variant).encodeStruct(ctx, serializer, struct, value);
            }

            decodeStruct(
                ctx: SerializationContext,
                deserializer: Deserializer<unknown>,
                struct: Deserializer.Struct
            ) {
                let variant = struct.field(variantKey, ctx, variantEndec, null);
                return variantToEndec(variant).decodeStruct(ctx, deserializer, struct);
            }
        })();
    }

    /**
     * Create a new dispatch endec which serializes variants of {@code T}
     * <p>
     * Such an endec is conceptually similar to a struct-dispatch one created through {@link #dispatchedStruct(Function, Function, Endec, String)}
     * (check the documentation on that function for a complete usage example), but because this family of endecs does not
     * require {@code T} to be a struct, the variant identifier field cannot be merged with the rest and is encoded separately
     */
    static dispatched<T, K>(
        variantToEndec: (x: K | null) => Endec<T>,
        instanceToVariant: (x: T) => K,
        variantEndec: Endec<K>
    ): StructEndec<T> {
        return new (class extends StructEndec<T> {
            encodeStruct(
                ctx: SerializationContext,
                serializer: Serializer<unknown>,
                struct: Serializer.Struct,
                value: T
            ) {
                let variant = instanceToVariant(value);
                struct.field('variant', ctx, variantEndec, variant, false);

                //noinspection unchecked
                struct.field('instance', ctx, variantToEndec(variant) as Endec<T>, value, false);
            }

            decodeStruct(
                ctx: SerializationContext,
                deserializer: Deserializer<unknown>,
                struct: Deserializer.Struct
            ): T {
                let variant = struct.field('variant', ctx, variantEndec, null);
                return struct.field('instance', ctx, variantToEndec(variant), null)!;
            }
        })();
    }

    // ---

    static ifAttr<T>(attribute: SerializationAttribute, endec: Endec<T>): AttributeEndecBuilder<T> {
        return new AttributeEndecBuilder(endec, attribute);
    }

    // --- Endec composition ---

    /**
     * Create a new endec which converts between instances of {@code T} and {@code R}
     * using {@code to} and {@code from} before encoding / after decoding
     */
    xmap<R>(to: (v: T) => R, from: (v: R) => T): Endec<R> {
        const endecObj = this;
        return Endec.endecOf(
            (ctx, serializer, value) => endecObj.encode(ctx, serializer, from(value)),
            (ctx, deserializer) => to(endecObj.decode(ctx, deserializer))
        );
    }

    /**
     * Create a new endec which converts between instances of {@code T} and {@code R}
     * using {@code to} and {@code from} before encoding / after decoding, optionally using
     * the current {@linkplain SerializationContext serialization context}
     */
    xmapWithContext<R>(
        to: (ctx: SerializationContext, v: T) => R,
        from: (ctx: SerializationContext, v: R) => T
    ): Endec<R> {
        const endecObj = this;
        return Endec.endecOf(
            (ctx, serializer, value) => endecObj.encode(ctx, serializer, from(ctx, value)),
            (ctx, deserializer) => to(ctx, endecObj.decode(ctx, deserializer))
        );
    }

    /**
     * Create a new endec which runs {@code validator} (giving it the chance to throw on
     * an invalid value) before encoding / after decoding
     */
    validate(validator: (v: T) => void): Endec<T> {
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

    static clampedMax(endec: Endec<number>, max: number): Endec<number> {
        return Endec.clamped(endec, null, max);
    }

    static rangedMax(endec: Endec<number>, max: number, throwError: boolean): Endec<number> {
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

    static ranged(
        endec: Endec<number>,
        min: number | null,
        max: number | null,
        throwError: boolean
    ): Endec<number> {
        let errorChecker = (n: number) => {
            // 1st check if the given min value exist and then compare similar to: [n < min]
            // 2nd check if the given min value exist and then compare similar to: [n > max]
            if (min != null && n < min) {
                if (throwError) throw new RangeNumberException(n, min, max);
                return min;
            } else if (max != null && n > max) {
                if (throwError) throw new RangeNumberException(n, min, max);
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
    catchErrors(decodeOnError: Endec.DecoderWithError<T>): Endec<T> {
        return Endec.endecOf(this.encode, (ctx, deserializer) => {
            try {
                return deserializer.tryRead((deserializer1) => this.decode(ctx, deserializer1));
            } catch (e) {
                return decodeOnError(ctx, deserializer, e instanceof Error ? e : new Error(`${e}`));
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
        return this.optionalOf().xmap((o) => o.getOrNull(), Option.ofNullable);
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
        return new KeyedEndec(key, this, defaultValueFactory);
    }

    // ---

    structOf(name: string): StructEndec<T> {
        const EndecObj = this;
        return StructEndec.structEndecOf(
            (ctx, serializer, struct, value) => struct.field(name, ctx, EndecObj, value, false),
            (ctx, serializer, struct) => struct.field(name, ctx, EndecObj, null)!
        );
    }

    recursiveStruct(builderFunc: (x: StructEndec<T>) => StructEndec<T>): StructEndec<T> {
        return new RecursiveStructEndec(builderFunc);
    }

    fieldOf<S>(name: string, getter: (x: S) => T): StructField<S, T> {
        return new StructField(name, this, getter);
    }

    optionalFieldOf<S>(
        name: string,
        getter: (x: S) => T,
        defaultValue: T | null
    ): StructField<S, T | null> {
        return new StructField(
            name,
            this.optionalOf().xmap(
                (optional) =>
                    defaultValue === null ? optional.getOrNull() : optional.getOrElse(defaultValue),
                Option.ofNullable
            ),
            getter,
            () => defaultValue
        );
    }

    optionalFieldOfLazy<S>(
        name: string,
        getter: (x: S) => T,
        defaultValue: () => T | null
    ): StructField<S, T | null> {
        return new StructField(
            name,
            this.optionalOf().xmap(
                (optional) => (optional as Option<T | null>).getOrCall(defaultValue),
                Option.ofNullable
            ),
            getter,
            defaultValue
        );
    }
}

export namespace Endec {
    export type Encoder<T> = (
        ctx: SerializationContext,
        serializer: Serializer<unknown>,
        value: T
    ) => void;

    export type Decoder<T> = (ctx: SerializationContext, deserializer: Deserializer<unknown>) => T;

    export type DecoderWithError<T> = (
        ctx: SerializationContext,
        deserializer: Deserializer<unknown>,
        exception: Error
    ) => T;
}
