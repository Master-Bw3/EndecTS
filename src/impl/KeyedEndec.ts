import { Endec } from "~/Endec";

export class KeyedEndec<F> {

    private key: string;
    private endec: Endec<F>;
    private defaultValueFactory: () => F;

    constructor(key: string, endec: Endec<F>, defaultValueFactory: () => F) {
        this.key = key;
        this.endec = endec;
        this.defaultValueFactory = defaultValueFactory;
    }

    getKey(): string {
        return this.key;
    }

    getEndec(): Endec<F> {
        return this.endec;
    }

    defaultValue(): F  {
        return this.defaultValueFactory();
    }
}
