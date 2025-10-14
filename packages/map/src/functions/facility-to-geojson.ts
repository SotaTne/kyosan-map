import { GeoJSONSourceSpecification } from "maplibre-gl";
import { Facility } from "../types/map-type";

export function facilityToGeoJSON(facilities: Facility[]): GeoJSONSourceSpecification {
    return {
        type: "geojson",
        data: {
            type: "FeatureCollection",
            features: facilities.map(facility => ({
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: [facility.longitude, facility.latitude]
                },
                properties: {
                    id: facility.id,
                    name: facility.name
                }
            }))
        }
    };
}