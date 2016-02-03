import { Frustum, Data } from '../Interfaces';
import { MeshStreamer } from '../MeshStreamer';
import { NV_PN_Generator } from './NV_PN';
import { V_PP_Generator } from './V_PP';
import { V_PD_Generator } from './V_PD';
import { V_PP_PD_Generator } from './V_PP_PD';

module geo {

    /**
     * A part of a configuration for streaming policy
     */
    export interface ConfigElement {

        /**
         * The proportion of the chunk that this element will occupy (must be between 0 and 1)
         */
        proportion : number;

        /**
         * The frustum of the current element
         */
         frustum? : Frustum;

         /**
          * Whether we should use precomputed faces of do the frustum culling
          */
        smart? : boolean;

        /**
         * Id of the recommendation to stream in case of smart streaming
         */
        recommendationId? : number;

    }

    /**
     * An array of ConfigElement. The sum of the proportion of the elements must be lower than 1
     */
    export type Config = ConfigElement[];

    /**
     * Class that represents a config generator.
     */
    export class ConfigGenerator {

        /**
         * The parent {@link MeshStreamer}
         */
        streamer : MeshStreamer;

        /**
         * Creates an empty config generator (generating always empty configs)
         * @param streamer the parent {@link MeshStreamer}
         */
        constructor(streamer : MeshStreamer) {

            this.streamer = streamer;

        }

        /**
         * Generates an empty configuration
         * @return an empty array
         */
        generateMainConfig(frustum? : Frustum, recoClicked? : number) : Config {

            process.stderr.write('Warning : empty config generator used\n');
            return [];

        };

        /**
         * Generates an empty configuration
         * @return an empty array
         */
        generateFillingConfig(previousConfig? : Config, previousData? : Data, cameraFrustum? : Frustum, recommendationClicked? : number) : Config {

            process.stderr.write('Warning : empty config generator used\n');
            return [];

        }

        /**
         * Creates a configuration generator from a string that can be 'NV-PN', 'V-PP', 'V-PD', or 'V-PP-PD'
         * @param pefetchingPolicy the string corresponding to the prefetching policy
         * @param streamer Reference to the mesh streamer
         * @return An instance of one of the subclasses of {@link ConfigGenerator}
         */
        static createFromString(prefetchingPolicy : string, streamer : MeshStreamer) : ConfigGenerator {

            switch (prefetchingPolicy) {
                case 'NV-PN'  : return new NV_PN_Generator(streamer);
                case 'V-PD'   : return new V_PD_Generator(streamer);
                case 'V-PP'   : return new V_PP_Generator(streamer);
                case 'V-PP-PD': return new V_PP_PD_Generator(streamer);
                default:
                    process.stderr.write('Warning : prefetch type not recognized, using default');
                    return new ConfigGenerator(streamer);

            }

        }

    }

}

export = geo;
