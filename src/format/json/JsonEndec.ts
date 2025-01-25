import { Deserializer } from '~/Deserializer';
import { Endec } from '~/endec';
import { SerializationContext } from '~/SerializationContext';
import { Serializer } from '~/Serializer';
import { JsonDeserializer } from './JsonDeserializer';
import { JsonSerializer } from './JsonSerializer';
import { isSelfDescribedSerializer, SelfDescribedSerializer } from '~/SelfDescribedSerializer';
import {
    isSelfDescribedDeSerializer,
    SelfDescribedDeSerializer,
} from '~/SelfDescribedDeserializer';

export class JsonEndec extends Endec<unknown> {
    static INSTANCE: JsonEndec = new JsonEndec();

    private constructor() {
        super();
    }

    encode(
        ctx: SerializationContext,
        serializer: Serializer<unknown> | SelfDescribedSerializer<unknown>,
        value: unknown
    ): void {
        if (isSelfDescribedSerializer(serializer)) {
            JsonDeserializer.of(value, this).readAny(ctx, serializer);
            return;
        }

        serializer.writeString(ctx, JSON.stringify(value));
    }

    decode(
        ctx: SerializationContext,
        deserializer: Deserializer<unknown> | SelfDescribedDeSerializer<unknown>
    ): unknown {
        if (isSelfDescribedDeSerializer(deserializer)) {
            var json = JsonSerializer.of();
            deserializer.readAny(ctx, json);

            return json.getResult();
        }

        return JSON.parse(deserializer.readString(ctx));
    }
}
