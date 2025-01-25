import { SerializationAttribute } from "./SerializationAttribute";

export namespace SerializationAttributes {

    /**
     * This format is intended to be human-readable (and potentially -editable)
     * <p>
     * Endecs should use this to make decisions like representing a
     * {@link net.minecraft.util.math.BlockPos} as an integer sequence instead of packing it into a long
     */
    export const HUMAN_READABLE: SerializationAttribute.Marker  = SerializationAttribute.marker("human_readable");
}