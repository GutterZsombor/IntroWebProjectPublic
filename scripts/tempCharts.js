const apiKey = "133296bd04e41d6d695787ea3b519772";
const linkForw = "https://api.openweathermap.org/data/2.5/forecast";
let unitDefault = "metric";


//Get unit 
document.querySelectorAll('input[name="unit"]').forEach(radio => {
    radio.addEventListener("change", (e) => {
       
         unitDefault = e.target.id;
         //console.log(unitDefault)

        currentLocation();
        
    });
});
const currentLocation = async () => {
    //from
    //https://developers.google.com/maps/documentation/javascript/geolocation#maps_map_geolocation-javascript
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async position => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                await makeChart(pos.lat, pos.lng, unitDefault);
            },
            err => {
                //console.log("Geolocation failed:", err.message);
                document.getElementById("chart").innerHTML = 
                    `<p>Please enable location services.</p>`;
            }
        );
    } else {
        //console.log("No support:", err.message);
         document.getElementById("chart").innerHTML = 
                    `<p>Geolocation not supported by browser</p>`;
            
    }
};
function unitParse(unit){
    let tUnit;
    let nunit;
    switch (unit) {
        case "imperial":
            tUnit = "°F";
            nunit = "fahrenheit";
            break;
        case "standard":
            tUnit = "°K";
            //convert maulally
            nunit = "celsius";

            break;
        default:
            tUnit = "°C";
            nunit = "celsius";

    }

    return{tUnit,nunit}

}
//almost same as original indexscript
async function OWea(lat, lng, unit) {
    const url = `${linkForw}?lat=${lat}&lon=${lng}&appid=${apiKey}&units=${unit}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("OpenWeather fetch failed");
    const data = await res.json();
   
    const tUnit=unitParse(unit).tUnit
    // same  8x3
    const forecastItems = [];
    for (let i = 0; i < 8 && i < data.list.length; i++) {
        forecastItems.push(data.list[i]);
    }
    const times = [];
    const temps = [];

    for (let i = 0; i < forecastItems.length; i++) {
        const item = forecastItems[i];
        times.push(new Date(item.dt * 1000).toLocaleTimeString([], { hour: "2-digit" }));
        temps.push(item.main.temp);
    }
    return { times, temps, tUnit };
}
//open-meteo
async function Meteo(lat, lng, unit) {
    
    const tUnit=unitParse(unit).tUnit
    const nunit=unitParse(unit).nunit
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=temperature_2m&forecast_days=2&temperature_unit=${nunit}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Open-Meteo fetch failed");
    const data = await res.json();

    const times = [];
    const temps = [];


    for (let i = 0; i < 24 && i < data.hourly.time.length; i++) {
        const timeString = new Date(data.hourly.time[i])
            .getHours()
            .toString()
            .padStart(2, "0") + ":00";
        times.push(timeString);
        if(tUnit=="°K"){
        temps.push(data.hourly.temperature_2m[i]+273);}
        else{
            temps.push(data.hourly.temperature_2m[i]);
        }
    }

    return { times, temps, tUnit };
}

//from homeworks
async function makeChart(lat, lng, unit) {

    try {
        const openWeather = await OWea(lat, lng, unit);
        const openMeteo = await Meteo(lat, lng, unit);

        const times = [];
        const openT = [];
        const metroT = [];

        const count = openWeather.times.length;
        for (let i = 0; i < count; i++) {
            times.push(openWeather.times[i]);
            openT.push(openWeather.temps[i]);
            metroT.push(openMeteo.temps[i]);
        }


        const symbol = openWeather.tUnit;
        const chart = new frappe.Chart("#chart", {
            title: "24-Hour In your Loacation",
            data: {
                labels: times,
                datasets: [
                    {
                        name: `OpenWeather`,
                        type: "line",
                        values: openT
                    },
                    {
                        name: `Open-Meteo`,
                        type: "line",
                        values: metroT
                    }
                ]
            },
            type: "line",
            height: 300,
            colors: ["#007bff", "#ff6b6b"],
            
            lineOptions: { regionFill: 1 },
            tooltipOptions: {
                formatTooltipX: d => `${d}`,
                formatTooltipY: d => `${d}${symbol}`
            }
        });

    }

    catch (err) {
        console.error(err);
        document.getElementById("chart").innerHTML =
            `<p>No data, somting is wrong</p>`;
    }

}


currentLocation();
