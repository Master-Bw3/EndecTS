export interface MapCarrier {

    /**
     * Get the value stored under {@code key} in this object's associated map.
     * If no such value exists, the default value of {@code key} is returned
     * <p>
     * Any exceptions thrown during decoding are propagated to the caller
     */
    getWithErrors<T>(ctx: SerializationContext, key: KeyedEndec<T>): T


    /**
     * Store {@code value} under {@code key} in this object's associated map
     */
    put<T>(ctx: SerializationContext, key: KeyedEndec<T>, value: T): void;


    /**
     * Delete the value stored under {@code key} from this object's associated map,
     * if it is present
     */
    delete<T>(key: KeyedEndec<T>): void;

    /**
     * Test whether there is a value stored under {@code key} in this object's associated map
     */
    has<T>(key:  KeyedEndec<T>): boolean

    // ---

    /**
     * Get the value stored under {@code key} in this object's associated map.
     * If no such value exists <i>or</i> an exception is thrown during decoding,
     * the default value of {@code key} is returned
     */
    get<T>(ctx: SerializationContext, key: KeyedEndec<T>): T

    /**
     * If {@code value} is not {@code null}, store it under {@code key} in this
     * object's associated map
     */
    putIfNotNull<T>(ctx: SerializationContext, key: KeyedEndec<T>, value: T): void


    /**
     * Store the value associated with {@code key} in this object's associated map
     * into the associated map of {@code other} under {@code key}
     * <p>
     * Importantly, this does not copy the value itself - be careful with mutable types
     */
    copy<T>(ctx: SerializationContext, key: KeyedEndec<T>, other: MapCarrier): void
    
    /**
     * Like {@link #copy(SerializationContext, KeyedEndec, MapCarrier)}, but only if this object's associated map
     * has a value stored under {@code key}
     */
    copyIfPresent<T>(ctx: SerializationContext, key: KeyedEndec<T>, other: MapCarrier): void

    /**
     * Get the value stored under {@code key} in this object's associated map, apply
     * {@code mutator} to it and store the result under {@code key}
     */
    mutate<T>(ctx: SerializationContext, key: KeyedEndec<T>, mutator: (x: T) => T): void
    //--
}
