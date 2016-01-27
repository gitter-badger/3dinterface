module Proto {

    export function getRecommendations(dummy : any) : L3D.CameraItf[] {

        if (dummy instanceof PeachScene)
            return RecommendationData.peachRecommendations;

        if (dummy instanceof WhompScene)
            return RecommendationData.whompRecommendations;

        if (dummy instanceof MountainScene)
            return RecommendationData.mountainRecommendations;

        if (dummy instanceof SponzaScene)
            return [];

        return [];

    }

}
