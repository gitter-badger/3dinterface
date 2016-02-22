import { MeshStreamer } from '../MeshStreamer';
import { ConfigGenerator } from './ConfigGenerator';
import { NV_PN_Generator } from './NV_PN';
import { V_PP_Generator } from './V_PP';
import { V_PD_Generator } from './V_PD';
import { V_PP_PD_Generator } from './V_PP_PD';

import * as log from '../../lib/log';

module geo {

    export class Dummy {

        /**
         * Creates a configuration generator from a string that can be 'NV-PN', 'V-PP', 'V-PD', or 'V-PP-PD'
         * @param pefetchingPolicy the string corresponding to the prefetching policy
         * @param streamer Reference to the mesh streamer
         * @return An instance of one of the subclasses of {@link ConfigGenerator}
         */
        static createConfigFromString(prefetchingPolicy : string, streamer : MeshStreamer) : ConfigGenerator {

            switch (prefetchingPolicy) {
                case 'NV-PN'  : return new NV_PN_Generator(streamer);
                case 'V-PD'   : return new V_PD_Generator(streamer);
                case 'V-PP'   : return new V_PP_Generator(streamer);
                case 'V-PP-PD': return new V_PP_PD_Generator(streamer);
                default:
                    log.warning('Warning : prefetch type not recognized, using default');
                    return new ConfigGenerator(streamer);

            }

        }

    }

    export var createConfigFromString = Dummy.createConfigFromString;

}

export = geo;
