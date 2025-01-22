import { Option } from "prelude-ts";
import * as utils from "./utils";

test('toString Formatting', () => {

    const edmElement = EdmElement.map(
        utils.make(() => new Map(), innerMap => {
            innerMap.set("ah_yes", EdmElement.sequence([EdmElement.i32(17), EdmElement.string("a")]));
            innerMap.set("hmmm", EdmElement.optional(Option.none));
            innerMap.set("uhhh", EdmElement.optional(
                    EdmElement.map(
                        utils.make(() => new Map(), map => {
                                map.set("b", EdmElement.optional(EdmElement.f32(16.5)));
                            })
                    )
            ));
        })
);

    expect(edmElement.toString()).toBe(
`map({
    "ah_yes": sequence([
    i32(17),
    string("a")
    ]),
    "hmmm": optional(),
    "uhhh": optional(map({
    "b": optional(f32(16.5))
    }))
})`
    );
});
