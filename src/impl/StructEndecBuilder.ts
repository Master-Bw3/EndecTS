import { Deserializer } from "~/Deserializer";
import { SerializationContext } from "~/SerializationContext";
import { Serializer } from "~/Serializer";
import { StructEndec } from "~/StructEndec";
import { StructField } from "./StructField";

export namespace StructEndecBuilder {
    export function of1<S, F1>(f1: StructField<S, F1>, constructor: (f1: F1) => S): StructEndec<S> {
        return new class extends StructEndec<S> {
            encodeStruct(ctx: SerializationContext, serializer: Serializer<unknown>, struct: Serializer.Struct, value: S): void {
                f1.encodeField(ctx, serializer, struct, value);
            }

            decodeStruct(ctx: SerializationContext, deserializer: Deserializer<unknown>, struct: Deserializer.Struct): S {
                return constructor(f1.decodeField(ctx, deserializer, struct));
            }
        }();
    }

    export function of2<S, F1, F2>(f1: StructField<S, F1>, f2: StructField<S, F2>, constructor: (f1: F1, f2: F2) => S): StructEndec<S> {
        return new class extends StructEndec<S> {
            encodeStruct(ctx: SerializationContext, serializer: Serializer<unknown>, struct: Serializer.Struct, value: S): void {
                f1.encodeField(ctx, serializer, struct, value);
                f2.encodeField(ctx, serializer, struct, value);
            }

            decodeStruct(ctx: SerializationContext, deserializer: Deserializer<unknown>, struct: Deserializer.Struct): S {
                return constructor(f1.decodeField(ctx, deserializer, struct), f2.decodeField(ctx, deserializer, struct));
            }
        }();
    }

    export function of3<S, F1, F2, F3>(f1: StructField<S, F1>, f2: StructField<S, F2>, f3: StructField<S, F3>, constructor: (f1: F1, f2: F2, f3: F3) => S): StructEndec<S> {
        return new class extends StructEndec<S> {
            encodeStruct(ctx: SerializationContext, serializer: Serializer<unknown>, struct: Serializer.Struct, value: S): void {
                f1.encodeField(ctx, serializer, struct, value);
                f2.encodeField(ctx, serializer, struct, value);
                f3.encodeField(ctx, serializer, struct, value);
            }

            decodeStruct(ctx: SerializationContext, deserializer: Deserializer<unknown>, struct: Deserializer.Struct): S {
                return constructor(
                    f1.decodeField(ctx, deserializer, struct),
                    f2.decodeField(ctx, deserializer, struct),
                    f3.decodeField(ctx, deserializer, struct)
                );
            }
        }();
    }

        export function of4<S, F1, F2, F3, F4>(f1: StructField<S, F1>, f2: StructField<S, F2>, f3: StructField<S, F3>, f4: StructField<S, F4>, constructor: (f1: F1, f2: F2, f3: F3, f4: F4) => S): StructEndec<S> {
        return new class extends StructEndec<S> {
            encodeStruct(ctx: SerializationContext, serializer: Serializer<unknown>, struct: Serializer.Struct, value: S): void {
                f1.encodeField(ctx, serializer, struct, value);
                f2.encodeField(ctx, serializer, struct, value);
                f3.encodeField(ctx, serializer, struct, value);
                f4.encodeField(ctx, serializer, struct, value);
            }

            decodeStruct(ctx: SerializationContext, deserializer: Deserializer<unknown>, struct: Deserializer.Struct): S {
                return constructor(
                    f1.decodeField(ctx, deserializer, struct),
                    f2.decodeField(ctx, deserializer, struct),
                    f3.decodeField(ctx, deserializer, struct),
                    f4.decodeField(ctx, deserializer, struct)
                );
            }
        }();
    }

    export function of5<S, F1, F2, F3, F4, F5>(f1: StructField<S, F1>, f2: StructField<S, F2>, f3: StructField<S, F3>, f4: StructField<S, F4>, f5: StructField<S, F5>, constructor: (f1: F1, f2: F2, f3: F3, f4: F4, f5: F5) => S): StructEndec<S> {
        return new class extends StructEndec<S> {
            encodeStruct(ctx: SerializationContext, serializer: Serializer<unknown>, struct: Serializer.Struct, value: S): void {
                f1.encodeField(ctx, serializer, struct, value);
                f2.encodeField(ctx, serializer, struct, value);
                f3.encodeField(ctx, serializer, struct, value);
                f4.encodeField(ctx, serializer, struct, value);
                f5.encodeField(ctx, serializer, struct, value);
            }

            decodeStruct(ctx: SerializationContext, deserializer: Deserializer<unknown>, struct: Deserializer.Struct): S {
                return constructor(
                    f1.decodeField(ctx, deserializer, struct),
                    f2.decodeField(ctx, deserializer, struct),
                    f3.decodeField(ctx, deserializer, struct),
                    f4.decodeField(ctx, deserializer, struct),
                    f5.decodeField(ctx, deserializer, struct)
                );
            }
        }();
    }

    export function of6<S, F1, F2, F3, F4, F5, F6>(f1: StructField<S, F1>, f2: StructField<S, F2>, f3: StructField<S, F3>, f4: StructField<S, F4>, f5: StructField<S, F5>, f6: StructField<S, F6>, constructor: (f1: F1, f2: F2, f3: F3, f4: F4, f5: F5, f6: F6) => S): StructEndec<S> {
        return new class extends StructEndec<S> {
            encodeStruct(ctx: SerializationContext, serializer: Serializer<unknown>, struct: Serializer.Struct, value: S): void {
                f1.encodeField(ctx, serializer, struct, value);
                f2.encodeField(ctx, serializer, struct, value);
                f3.encodeField(ctx, serializer, struct, value);
                f4.encodeField(ctx, serializer, struct, value);
                f5.encodeField(ctx, serializer, struct, value);
                f6.encodeField(ctx, serializer, struct, value);
            }

            decodeStruct(ctx: SerializationContext, deserializer: Deserializer<unknown>, struct: Deserializer.Struct): S {
                return constructor(
                    f1.decodeField(ctx, deserializer, struct),
                    f2.decodeField(ctx, deserializer, struct),
                    f3.decodeField(ctx, deserializer, struct),
                    f4.decodeField(ctx, deserializer, struct),
                    f5.decodeField(ctx, deserializer, struct),
                    f6.decodeField(ctx, deserializer, struct)
                );
            }
        }();
    }

    export function of7<S, F1, F2, F3, F4, F5, F6, F7>(f1: StructField<S, F1>, f2: StructField<S, F2>, f3: StructField<S, F3>, f4: StructField<S, F4>, f5: StructField<S, F5>, f6: StructField<S, F6>, f7: StructField<S, F7>, constructor: (f1: F1, f2: F2, f3: F3, f4: F4, f5: F5, f6: F6, f7: F7) => S): StructEndec<S> {
        return new class extends StructEndec<S> {
            encodeStruct(ctx: SerializationContext, serializer: Serializer<unknown>, struct: Serializer.Struct, value: S): void {
                f1.encodeField(ctx, serializer, struct, value);
                f2.encodeField(ctx, serializer, struct, value);
                f3.encodeField(ctx, serializer, struct, value);
                f4.encodeField(ctx, serializer, struct, value);
                f5.encodeField(ctx, serializer, struct, value);
                f6.encodeField(ctx, serializer, struct, value);
                f7.encodeField(ctx, serializer, struct, value);
            }

            decodeStruct(ctx: SerializationContext, deserializer: Deserializer<unknown>, struct: Deserializer.Struct): S {
                return constructor(
                    f1.decodeField(ctx, deserializer, struct),
                    f2.decodeField(ctx, deserializer, struct),
                    f3.decodeField(ctx, deserializer, struct),
                    f4.decodeField(ctx, deserializer, struct),
                    f5.decodeField(ctx, deserializer, struct),
                    f6.decodeField(ctx, deserializer, struct),
                    f7.decodeField(ctx, deserializer, struct)
                );
            }
        }();
    }

    export function of8<S, F1, F2, F3, F4, F5, F6, F7, F8>(f1: StructField<S, F1>, f2: StructField<S, F2>, f3: StructField<S, F3>, f4: StructField<S, F4>, f5: StructField<S, F5>, f6: StructField<S, F6>, f7: StructField<S, F7>, f8: StructField<S, F8>, constructor: (f1: F1, f2: F2, f3: F3, f4: F4, f5: F5, f6: F6, f7: F7, f8: F8) => S): StructEndec<S> {
        return new class extends StructEndec<S> {
            encodeStruct(ctx: SerializationContext, serializer: Serializer<unknown>, struct: Serializer.Struct, value: S): void {
                f1.encodeField(ctx, serializer, struct, value);
                f2.encodeField(ctx, serializer, struct, value);
                f3.encodeField(ctx, serializer, struct, value);
                f4.encodeField(ctx, serializer, struct, value);
                f5.encodeField(ctx, serializer, struct, value);
                f6.encodeField(ctx, serializer, struct, value);
                f7.encodeField(ctx, serializer, struct, value);
                f8.encodeField(ctx, serializer, struct, value);
            }

            decodeStruct(ctx: SerializationContext, deserializer: Deserializer<unknown>, struct: Deserializer.Struct): S {
                return constructor(
                    f1.decodeField(ctx, deserializer, struct),
                    f2.decodeField(ctx, deserializer, struct),
                    f3.decodeField(ctx, deserializer, struct),
                    f4.decodeField(ctx, deserializer, struct),
                    f5.decodeField(ctx, deserializer, struct),
                    f6.decodeField(ctx, deserializer, struct),
                    f7.decodeField(ctx, deserializer, struct),
                    f8.decodeField(ctx, deserializer, struct)
                );
            }
        }();
    }

    export function of9<S, F1, F2, F3, F4, F5, F6, F7, F8, F9>(f1: StructField<S, F1>, f2: StructField<S, F2>, f3: StructField<S, F3>, f4: StructField<S, F4>, f5: StructField<S, F5>, f6: StructField<S, F6>, f7: StructField<S, F7>, f8: StructField<S, F8>, f9: StructField<S, F9>, constructor: (f1: F1, f2: F2, f3: F3, f4: F4, f5: F5, f6: F6, f7: F7, f8: F8, f9: F9) => S): StructEndec<S> {
        return new class extends StructEndec<S> {
            encodeStruct(ctx: SerializationContext, serializer: Serializer<unknown>, struct: Serializer.Struct, value: S): void {
                f1.encodeField(ctx, serializer, struct, value);
                f2.encodeField(ctx, serializer, struct, value);
                f3.encodeField(ctx, serializer, struct, value);
                f4.encodeField(ctx, serializer, struct, value);
                f5.encodeField(ctx, serializer, struct, value);
                f6.encodeField(ctx, serializer, struct, value);
                f7.encodeField(ctx, serializer, struct, value);
                f8.encodeField(ctx, serializer, struct, value);
                f9.encodeField(ctx, serializer, struct, value);
            }

            decodeStruct(ctx: SerializationContext, deserializer: Deserializer<unknown>, struct: Deserializer.Struct): S {
                return constructor(
                    f1.decodeField(ctx, deserializer, struct),
                    f2.decodeField(ctx, deserializer, struct),
                    f3.decodeField(ctx, deserializer, struct),
                    f4.decodeField(ctx, deserializer, struct),
                    f5.decodeField(ctx, deserializer, struct),
                    f6.decodeField(ctx, deserializer, struct),
                    f7.decodeField(ctx, deserializer, struct),
                    f8.decodeField(ctx, deserializer, struct),
                    f9.decodeField(ctx, deserializer, struct)
                );
            }
        }();
    }

    export function of10<S, F1, F2, F3, F4, F5, F6, F7, F8, F9, F10>(f1: StructField<S, F1>, f2: StructField<S, F2>, f3: StructField<S, F3>, f4: StructField<S, F4>, f5: StructField<S, F5>, f6: StructField<S, F6>, f7: StructField<S, F7>, f8: StructField<S, F8>, f9: StructField<S, F9>, f10: StructField<S, F10>, constructor: (f1: F1, f2: F2, f3: F3, f4: F4, f5: F5, f6: F6, f7: F7, f8: F8, f9: F9, f10: F10) => S): StructEndec<S> {
        return new class extends StructEndec<S> {
            encodeStruct(ctx: SerializationContext, serializer: Serializer<unknown>, struct: Serializer.Struct, value: S): void {
                f1.encodeField(ctx, serializer, struct, value);
                f2.encodeField(ctx, serializer, struct, value);
                f3.encodeField(ctx, serializer, struct, value);
                f4.encodeField(ctx, serializer, struct, value);
                f5.encodeField(ctx, serializer, struct, value);
                f6.encodeField(ctx, serializer, struct, value);
                f7.encodeField(ctx, serializer, struct, value);
                f8.encodeField(ctx, serializer, struct, value);
                f9.encodeField(ctx, serializer, struct, value);
                f10.encodeField(ctx, serializer, struct, value);
            }

            decodeStruct(ctx: SerializationContext, deserializer: Deserializer<unknown>, struct: Deserializer.Struct): S {
                return constructor(
                    f1.decodeField(ctx, deserializer, struct),
                    f2.decodeField(ctx, deserializer, struct),
                    f3.decodeField(ctx, deserializer, struct),
                    f4.decodeField(ctx, deserializer, struct),
                    f5.decodeField(ctx, deserializer, struct),
                    f6.decodeField(ctx, deserializer, struct),
                    f7.decodeField(ctx, deserializer, struct),
                    f8.decodeField(ctx, deserializer, struct),
                    f9.decodeField(ctx, deserializer, struct),
                    f10.decodeField(ctx, deserializer, struct)
                );
            }
        }();
    }

    export function of11<S, F1, F2, F3, F4, F5, F6, F7, F8, F9, F10, F11>(f1: StructField<S, F1>, f2: StructField<S, F2>, f3: StructField<S, F3>, f4: StructField<S, F4>, f5: StructField<S, F5>, f6: StructField<S, F6>, f7: StructField<S, F7>, f8: StructField<S, F8>, f9: StructField<S, F9>, f10: StructField<S, F10>, f11: StructField<S, F11>, constructor: (f1: F1, f2: F2, f3: F3, f4: F4, f5: F5, f6: F6, f7: F7, f8: F8, f9: F9, f10: F10, f11: F11) => S): StructEndec<S> {
        return new class extends StructEndec<S> {
            encodeStruct(ctx: SerializationContext, serializer: Serializer<unknown>, struct: Serializer.Struct, value: S): void {
                f1.encodeField(ctx, serializer, struct, value);
                f2.encodeField(ctx, serializer, struct, value);
                f3.encodeField(ctx, serializer, struct, value);
                f4.encodeField(ctx, serializer, struct, value);
                f5.encodeField(ctx, serializer, struct, value);
                f6.encodeField(ctx, serializer, struct, value);
                f7.encodeField(ctx, serializer, struct, value);
                f8.encodeField(ctx, serializer, struct, value);
                f9.encodeField(ctx, serializer, struct, value);
                f10.encodeField(ctx, serializer, struct, value);
                f11.encodeField(ctx, serializer, struct, value);
            }

            decodeStruct(ctx: SerializationContext, deserializer: Deserializer<unknown>, struct: Deserializer.Struct): S {
                return constructor(
                    f1.decodeField(ctx, deserializer, struct),
                    f2.decodeField(ctx, deserializer, struct),
                    f3.decodeField(ctx, deserializer, struct),
                    f4.decodeField(ctx, deserializer, struct),
                    f5.decodeField(ctx, deserializer, struct),
                    f6.decodeField(ctx, deserializer, struct),
                    f7.decodeField(ctx, deserializer, struct),
                    f8.decodeField(ctx, deserializer, struct),
                    f9.decodeField(ctx, deserializer, struct),
                    f10.decodeField(ctx, deserializer, struct),
                    f11.decodeField(ctx, deserializer, struct)
                );
            }
        }();
    }

    export function of12<S, F1, F2, F3, F4, F5, F6, F7, F8, F9, F10, F11, F12>(f1: StructField<S, F1>, f2: StructField<S, F2>, f3: StructField<S, F3>, f4: StructField<S, F4>, f5: StructField<S, F5>, f6: StructField<S, F6>, f7: StructField<S, F7>, f8: StructField<S, F8>, f9: StructField<S, F9>, f10: StructField<S, F10>, f11: StructField<S, F11>, f12: StructField<S, F12>, constructor: (f1: F1, f2: F2, f3: F3, f4: F4, f5: F5, f6: F6, f7: F7, f8: F8, f9: F9, f10: F10, f11: F11, f12: F12) => S): StructEndec<S> {
        return new class extends StructEndec<S> {
            encodeStruct(ctx: SerializationContext, serializer: Serializer<unknown>, struct: Serializer.Struct, value: S): void {
                f1.encodeField(ctx, serializer, struct, value);
                f2.encodeField(ctx, serializer, struct, value);
                f3.encodeField(ctx, serializer, struct, value);
                f4.encodeField(ctx, serializer, struct, value);
                f5.encodeField(ctx, serializer, struct, value);
                f6.encodeField(ctx, serializer, struct, value);
                f7.encodeField(ctx, serializer, struct, value);
                f8.encodeField(ctx, serializer, struct, value);
                f9.encodeField(ctx, serializer, struct, value);
                f10.encodeField(ctx, serializer, struct, value);
                f11.encodeField(ctx, serializer, struct, value);
                f12.encodeField(ctx, serializer, struct, value);
            }

            decodeStruct(ctx: SerializationContext, deserializer: Deserializer<unknown>, struct: Deserializer.Struct): S {
                return constructor(
                    f1.decodeField(ctx, deserializer, struct),
                    f2.decodeField(ctx, deserializer, struct),
                    f3.decodeField(ctx, deserializer, struct),
                    f4.decodeField(ctx, deserializer, struct),
                    f5.decodeField(ctx, deserializer, struct),
                    f6.decodeField(ctx, deserializer, struct),
                    f7.decodeField(ctx, deserializer, struct),
                    f8.decodeField(ctx, deserializer, struct),
                    f9.decodeField(ctx, deserializer, struct),
                    f10.decodeField(ctx, deserializer, struct),
                    f11.decodeField(ctx, deserializer, struct),
                    f12.decodeField(ctx, deserializer, struct)
                );
            }
        }
    }

    export function of17<S, F1, F2, F3, F4, F5, F6, F7, F8, F9, F10, F11, F12, F13, F14, F15, F16, F17>(
        f1: StructField<S, F1>, f2: StructField<S, F2>, f3: StructField<S, F3>, f4: StructField<S, F4>, f5: StructField<S, F5>,
        f6: StructField<S, F6>, f7: StructField<S, F7>, f8: StructField<S, F8>, f9: StructField<S, F9>, f10: StructField<S, F10>,
        f11: StructField<S, F11>, f12: StructField<S, F12>, f13: StructField<S, F13>, f14: StructField<S, F14>, f15: StructField<S, F15>,
        f16: StructField<S, F16>, f17: StructField<S, F17>, constructor: (f1: F1, f2: F2, f3: F3, f4: F4, f5: F5, f6: F6, f7: F7, f8: F8, f9: F9, f10: F10,
                                                                            f11: F11, f12: F12, f13: F13, f14: F14, f15: F15, f16: F16, f17: F17) => S): StructEndec<S> {
        return new class extends StructEndec<S> {
            encodeStruct(ctx: SerializationContext, serializer: Serializer<unknown>, struct: Serializer.Struct, value: S): void {
                f1.encodeField(ctx, serializer, struct, value);
                f2.encodeField(ctx, serializer, struct, value);
                f3.encodeField(ctx, serializer, struct, value);
                f4.encodeField(ctx, serializer, struct, value);
                f5.encodeField(ctx, serializer, struct, value);
                f6.encodeField(ctx, serializer, struct, value);
                f7.encodeField(ctx, serializer, struct, value);
                f8.encodeField(ctx, serializer, struct, value);
                f9.encodeField(ctx, serializer, struct, value);
                f10.encodeField(ctx, serializer, struct, value);
                f11.encodeField(ctx, serializer, struct, value);
                f12.encodeField(ctx, serializer, struct, value);
                f13.encodeField(ctx, serializer, struct, value);
                f14.encodeField(ctx, serializer, struct, value);
                f15.encodeField(ctx, serializer, struct, value);
                f16.encodeField(ctx, serializer, struct, value);
                f17.encodeField(ctx, serializer, struct, value);
            }

            decodeStruct(ctx: SerializationContext, deserializer: Deserializer<unknown>, struct: Deserializer.Struct): S {
                return constructor(
                    f1.decodeField(ctx, deserializer, struct),
                    f2.decodeField(ctx, deserializer, struct),
                    f3.decodeField(ctx, deserializer, struct),
                    f4.decodeField(ctx, deserializer, struct),
                    f5.decodeField(ctx, deserializer, struct),
                    f6.decodeField(ctx, deserializer, struct),
                    f7.decodeField(ctx, deserializer, struct),
                    f8.decodeField(ctx, deserializer, struct),
                    f9.decodeField(ctx, deserializer, struct),
                    f10.decodeField(ctx, deserializer, struct),
                    f11.decodeField(ctx, deserializer, struct),
                    f12.decodeField(ctx, deserializer, struct),
                    f13.decodeField(ctx, deserializer, struct),
                    f14.decodeField(ctx, deserializer, struct),
                    f15.decodeField(ctx, deserializer, struct),
                    f16.decodeField(ctx, deserializer, struct),
                    f17.decodeField(ctx, deserializer, struct)
                );
            }
        }();
    }
}