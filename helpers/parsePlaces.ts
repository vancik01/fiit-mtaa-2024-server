import { AddressComponent } from "@googlemaps/google-maps-services-js";

export function parseAddressComponents(address_components: AddressComponent[]) {
    const addressComponents = address_components;
    let streetAddress = "";
    let city = "";
    let state = "";

    addressComponents.forEach((component) => {
        //@ts-ignore
        if (component.types.includes("street_number")) {
            streetAddress += component.long_name + " ";
        }
        //@ts-ignore
        if (component.types.includes("route")) {
            streetAddress += component.long_name;
        }

        if (
            //@ts-ignore
            component.types.includes("locality") ||
            //@ts-ignore
            component.types.includes("sublocality_level_1")
        ) {
            city = component.long_name;
        }
        //@ts-ignore
        if (component.types.includes("country")) {
            state = component.long_name;
        }
    });

    return { streetAddress, city, state };
}
