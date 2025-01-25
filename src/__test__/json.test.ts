import { Endec, StructEndecBuilder } from '~/endec';
import { JsonSerializer } from '~/format/json/JsonSerializer';
import { make } from './utils';
import { JsonDeserializer } from '~/format/json/JsonDeserializer';
import { JsonEndec } from '~/format/json/JsonEndec';

test('encode string', () => {
    const value = 'an epic string';
    const result = Endec.STRING.encodeFully(JsonSerializer.of, value);
    console.log('Result: ' + result + ', Type: ' + typeof result);
});

test('encode struct', () => {
    const endec = StructEndecBuilder.of4(
        Endec.STRING.fieldOf('a_field', (x: StructObject) => x.aField),
        Endec.STRING.mapOf().fieldOf('a_nested_field', (x: StructObject) => x.aNestedField),
        Endec.DOUBLE.listOf().fieldOf('list_moment', (x: StructObject) => x.listMoment),
        Endec.STRING.fieldOf('another_field', (x: StructObject) => x.anotherField),
        structObjectOf
    );

    const structObject = structObjectOf(
        'an epic field value',
        make(
            () => new Map(),
            (map) => {
                map.set('a', 'bruh');
                map.set('b', 'nested field value, epic');
            }
        ),
        [1.0, 5.7, Number.MAX_VALUE],
        'this too'
    );

    const encodedElement = endec.encodeFully(JsonSerializer.of, structObject);

    expect(encodedElement).toBe(
        make(
            () => {
                return {};
            },
            (jsonObject: Record<string, unknown>) => {
                jsonObject['a_field'] = 'an epic field value';
                jsonObject['a_nested_field'] = make(
                    () => {
                        return {};
                    },
                    (jsonObject1: Record<string, unknown>) => {
                        jsonObject1['a'] = 'bruh';
                        jsonObject1['b'] = ['nested field value, epic'];
                    }
                );

                jsonObject['list_moment'] = make(Array, (jsonArray) => {
                    jsonArray.push(1.0);
                    jsonArray.push(5.7);
                    jsonArray.push(Number.MAX_VALUE);
                });
                jsonObject['another_field'] = 'this too';
            }
        )
    );

    const decodedValue = endec.decodeFully((x) => JsonDeserializer.of(x, JsonEndec.INSTANCE), encodedElement);

    expect(decodedValue).toEqual(structObject);
});

type StructObject = {
    aField: string;
    aNestedField: Map<string, string>;
    listMoment: Array<number>;
    anotherField: string;
};

function structObjectOf(
    aField: string,
    aNestedField: Map<string, string>,
    listMoment: Array<number>,
    anotherField: string
): StructObject {
    return {
        aField: aField,
        aNestedField: aNestedField,
        listMoment: listMoment,
        anotherField: anotherField,
    };
}
