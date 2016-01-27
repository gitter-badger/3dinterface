/**
 * Represents the coins that we are supposed to add to a scene
 */
interface CoinConfig {

    /** If we should see the coins at the beginning */
    visible ?: boolean;

    /** Type of config */
    type : ConfigType;

    /** If type == ConfigType.SOME, the ids of the coins to add */
    ids ?: number[];


}

/**
 * Types of configuration
 */
enum ConfigType {

    NONE,
    SOME,
    ALL

}
