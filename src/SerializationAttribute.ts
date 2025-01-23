export abstract class SerializationAttribute {

    name: string;

    constructor( name: string) {
        this.name = name;
    }

    static marker(name: string): SerializationAttribute.Marker {
        return new SerializationAttribute.Marker(name);
    }

    static  withValue<T>(name: string): SerializationAttribute.WithValue<T>  {
        return new SerializationAttribute.WithValue(name);
    }

}

export namespace SerializationAttribute {
    export interface Instance {
        attribute(): SerializationAttribute;
        value(): unknown;
    }
    
    export class Marker extends SerializationAttribute implements Instance {
        constructor(name: string) {
            super(name);
        }
    
        public attribute(): SerializationAttribute {
            return this;
        }
    
        public value(): unknown {
            return null;
        }
    }
    
    export class WithValue<T> extends SerializationAttribute {
        constructor(name: string) {
            super(name);
        }
    
        public instance(value: T): Instance {
            const withValue = this;
            return {
                attribute() {
                    return withValue;
                },
    
                value() {
                    return value;
                }
            };
        }
    }
}