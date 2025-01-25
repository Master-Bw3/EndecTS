import { Deserializer } from "~/Deserializer";
import { Endec } from "~/Endec";
import { SerializationAttribute } from "~/SerializationAttribute";
import { SerializationContext } from "~/SerializationContext";
import { Serializer } from "~/Serializer";

export class AttributeEndecBuilder<T> {

    private branches: Map<SerializationAttribute, Endec<T>> = new Map();

    constructor(endec: Endec<T>, attribute: SerializationAttribute) {
        this.branches.set(attribute, endec);
    }

    orElseIf(attribute: SerializationAttribute, endec: Endec<T>): AttributeEndecBuilder<T> {
        if (Array.from(this.branches.keys()).includes(attribute)) {
            throw new Error("Cannot have more than one branch for attribute " + attribute.name);
        }

        this.branches.set(attribute, endec);
        return this;
    }

    orElse(endec: Endec<T>): Endec<T> {
        const AttributeEndecBuilderObj = this;

        return new class extends Endec<T> {
            
            encode(ctx: SerializationContext, serializer: Serializer<unknown>, value: T): void {
                let branchEndec = endec;

                for (const branch of AttributeEndecBuilderObj.branches) {
                    if (ctx.hasAttribute(branch[0])) {
                        branchEndec = branch[1];
                        break;
                    }
                }

                branchEndec.encode(ctx, serializer, value);
            }

            decode(ctx: SerializationContext, deserializer: Deserializer<unknown>): T {
                let branchEndec = endec;

                for (const branch of AttributeEndecBuilderObj.branches) {
                    if (ctx.hasAttribute(branch[0])) {
                        branchEndec = branch[1];
                        break;
                    }
                }

                return branchEndec.decode(ctx, deserializer);
            }
        }();
    }
}