export class SerializationContext {

    private static EMPTY: SerializationContext = new SerializationContext(new Map(), new Set());

    private attributeValues:  Map<SerializationAttribute, unknown>;
    private suppressedAttributes: Set<SerializationAttribute>;

    private constructor(attributeValues: Map<SerializationAttribute, unknown>, suppressedAttributes: Set<SerializationAttribute>) {
        this.attributeValues = new Map(attributeValues);
        this.suppressedAttributes = new Set(suppressedAttributes);
    }

     static empty(): SerializationContext {
        return this.EMPTY;
    }

     static attributes(...attributes: SerializationAttribute.Instance): SerializationContext {
        if (attributes.length == 0) return this.EMPTY;
        return new SerializationContext(this.unpackAttributes(attributes), new Set());
    }

     static suppressed(SerializationAttribute... attributes): SerializationContext {
        if (attributes.length == 0) return this.EMPTY;
        return new SerializationContext(new Map(), new Set(attributes));
    }

     withAttributes(...attributes: SerializationAttribute.Instance): SerializationContext {
        let newAttributes = this.unpackAttributes(attributes);
        this.attributeValues.forEach((attribute, value) => {
            if (!newAttributes.containsKey(attribute)) {
                newAttributes.put(attribute, value);
            }
        });

        return new SerializationContext(newAttributes, this.suppressedAttributes);
    }

     withoutAttributes(...attributes: SerializationAttribute): SerializationContext {
        let newAttributes = new Map(this.attributeValues);
        for (const attribute of attributes) {
            newAttributes.delete(attribute);
        }

        return new SerializationContext(newAttributes, this.suppressedAttributes);
    }

     withSuppressed(...attributes: SerializationAttribute): SerializationContext {
        let newSuppressed = new Set<SerializationAttribute>(this.suppressedAttributes);
        attributes.array.forEach((attribute: SerializationAttribute) => {
            newSuppressed.add(attribute)
        });

        return new SerializationContext(this.attributeValues, newSuppressed);
    }

     withoutSuppressed(...attributes: SerializationAttribute): SerializationContext {
        let newSuppressed = new Set(this.suppressedAttributes);
        for (const attribute of attributes) {
            newSuppressed.delete(attribute);
        }

        return new SerializationContext(this.attributeValues, newSuppressed);
    }

     and(other: SerializationContext): SerializationContext {
        let newAttributeValues = new Map(...this.attributeValues, ...other.attributeValues);

        let newSuppressed = new Set(...this.suppressedAttributes, ...other.suppressedAttributes);

        return new SerializationContext(newAttributeValues, newSuppressed);
    }

     hasAttribute(attribute: SerializationAttribute): boolean {
        return Array.from(this.attributeValues.keys()).includes(attribute) && !Array.from(this.suppressedAttributes).includes(attribute);
    }

    getAttributeValue<A>(attribute: SerializationAttribute.WithValue<A> ): A {
        return this.attributeValues.get(attribute) as A;
    }

    requireAttributeValue<A>(attribute: SerializationAttribute.WithValue<A>): A {
        if (!this.hasAttribute(attribute)) {
            throw new Error("Context did not provide a value for attribute '" + attribute.name + "'");
        }

        return this.getAttributeValue(attribute);
    }

    private static unpackAttributes(attributes: Array<SerializationAttribute.Instance>): Map<SerializationAttribute, unknown> {
        let attributeValues = new Map<SerializationAttribute, Object>();
        for (const instance of attributes) {
            attributeValues.set(instance.attribute(), instance.value());
        }

        return attributeValues;
    }
}
