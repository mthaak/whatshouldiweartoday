import { Loader, LoaderOptions } from 'google-maps';

const API_KEY =


const options: LoaderOptions = {/* todo */ };
const loader = new Loader('my-api-key', options);

const google = await loader.load();
const geocoder = new google.maps.Geocoder();

function geocodeLatLng(
  geocoder: google.maps.Geocoder
) {
  const input = (document.getElementById("latlng") as HTMLInputElement).value;
  const latlngStr = input.split(",", 2);
  const latlng = {
    lat: parseFloat(latlngStr[0]),
    lng: parseFloat(latlngStr[1]),
  };
  geocoder.geocode(
    { location: latlng },
    (
      results: google.maps.GeocoderResult[],
      status: google.maps.GeocoderStatus
    ) => {
      if (status === "OK") {
        if (results[0]) {
          console.log(results[0]);
        } else {
          console.log("No results found");
        }
      } else {
        console.log("Geocoder failed due to: " + status);
      }
    }
  );
}
