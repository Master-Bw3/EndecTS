import { Deserializer } from "./Deserializer";
import { SerializationContext } from "./SerializationContext";
import { Serializer } from "./Serializer";

export interface SelfDescribedDeSerializer<T> extends Deserializer<T> {
    readAny<S> (ctx: SerializationContext, visitor: Serializer<S>): void;
}

export function isSelfDescribedDeSerializer<T>(object: any): object is SelfDescribedDeSerializer<T> {
    return "readAny" in object
}