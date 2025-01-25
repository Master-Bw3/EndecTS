import { Serializer } from "./Serializer";

export interface SelfDescribedSerializer<T> extends Serializer<T> {
    discriminator: "SelfDescribedSerializer"
}

export function isSelfDescribedSerializer<T>(object: any): object is SelfDescribedSerializer<T> {
    return object.descriminator === "SelfDescribedSerializer"
}