const apiKey = "133296bd04e41d6d695787ea3b519772";
const meteoblueapikey="kgZsEfQxwdr2CquI"

const linkCurentw = "https://api.openweathermap.org/data/2.5/weather";
const linkForw = "https://api.openweathermap.org/data/2.5/forecast";
//const linkForDaily = "https://api.openweathermap.org/data/2.5/forecast/daily";
let unitDefault="metric";
//favourite
let preSearch = [];

//Get unit 
document.querySelectorAll('input[name="unit"]').forEach(radio => {
    radio.addEventListener("change", (e) => {
        
         unitDefault = e.target.id;
         //console.log(unitDefault)

        
        const city = document.getElementById("locName").textContent.split(",")[0];
        if (city && city !== "--") {
           
            fetchWeatherData("city", linkCurentw, city, null, unitDefault);
            fetchWeatherData("city", linkForw, city, null, unitDefault);
            fetchWeatherData("sevencity", null, city, null, unitDefault);
           
        }
    });
});





//curent location Geolocation API
const currentLocation = () => {
    //from
    //https://developers.google.com/maps/documentation/javascript/geolocation#maps_map_geolocation-javascript
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                 const pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        };
                fetchWeatherData("coord", linkCurentw, pos.lat, pos.lng, unitDefault);
                fetchWeatherData("coord", linkForw, pos.lat, pos.lng, unitDefault);
                fetchWeatherData("sevencoor", null, pos.lat, pos.lng, unitDefault);

                //sevenurl(pos.lat, pos.lng,unitDefault) 
            },
            err => {
                console.log("Geolocation failed:", err.message);
              
                fetchWeatherData("city", linkCurentw, "Lappeenranta", null, unitDefault);
                fetchWeatherData("city", linkForw, "Lappeenranta", null, unitDefault);
                fetchWeatherData("sevencity", null, "Lappeenranta", null, unitDefault);    
                //fetchCityCu_For(linkForDaily,"Lappeenranta",unitDefault);
            }
        );
    } else {
        // Browser doesn't support Geolocation
        //default
                fetchWeatherData("city", linkCurentw, "Lappeenranta", null, unitDefault);
                fetchWeatherData("city", linkForw, "Lappeenranta", null, unitDefault);
                fetchWeatherData("sevencity", null, "Lappeenranta", null, unitDefault);
                
    }
};


//handle all cases yeah
async function fetchWeatherData(type, urll, var1, var2, unit) {
    try {
      
        let url = "";
        if (type == "city") {
        
            url = `${urll}?q=${var1}&appid=${apiKey}&units=${unit}`;
        } else if (type == "coord") {
            
            url = `${urll}?lat=${var1}&lon=${var2}&appid=${apiKey}&units=${unit}`;
        } else if (type=="sevencoor"){

            url=sevenurl(var1, var2,unit);

        }
        else if (type=="sevencity"){
            
                // OpenWeatherMap geocoding API 
                // getting coordinates fro city names
                const geocodeUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${var1}&limit=1&appid=${apiKey}`;
                const geoResponse = await fetch(geocodeUrl);
                if (!geoResponse.ok) throw new Error("Geocoding failed");
                const geoData = await geoResponse.json();
                
                    const lat = geoData[0].lat;
                    const lon = geoData[0].lon;
                    url = sevenurl(lat, lon, unit);       

        }
        console.log(url);

        const response = await fetch(url);
        if (!response.ok) throw new Error("Weather data fetch failed");

        const data = await response.json();

        
        if (urll === linkCurentw) {
            current(data);
        } else if (urll === linkForw) {
            hourlyfor(data);
            
        }else{
            sevendayforcast(data)
        }
    } catch (err) {
        console.log(err);
        
    }
}
 function sevenurl(lat, lon,unit) {
    //try {
        
        //const url = `https://my.meteoblue.com/packages/basic-day?lat=${lat}&lon=${lon}&apikey=${meteoblueapikey}`;
        if (unit=="imperial"){
         url=`https://my.meteoblue.com/packages/basic-day?apikey=${meteoblueapikey}&lat=${lat}&lon=${lon}&asl=279&format=json&temperature=F`
        }else{
            //celsius kelvin handelt in chart
            url=`https://my.meteoblue.com/packages/basic-day?apikey=${meteoblueapikey}&lat=${lat}&lon=${lon}&asl=279&format=json&temperature=C`
        }
        return url
    
}

//set page color
function pagecolor(unit,temp){
    //let temp = data.main.temp;
    const body = document.body;

    // remove previous
    body.classList.remove("cold", "cool", "warm", "hot");

    //convert to celsius
    switch (unit) {
        case "imperial":
            temp = (temp - 32) * 5/9;
            break;
        case "standard":
             temp = temp - 273;
            break;
        default:
           break;
            // //  temperature color
    }
    //add class
    //temp=30;
    if (temp < 0) body.classList.add("cold");
    else if (temp < 10) body.classList.add("cool");
    else if (temp < 25) body.classList.add("warm");
    else body.classList.add("hot");
    
    
}

//update current card
function current(data) {

    let tUnit, wUnit;
    switch (unitDefault) {
        case "imperial":
            tUnit = "°F";
            wUnit = "mph";
            break;
        case "standard":
            tUnit = "°K";
            wUnit = "m/s"; 
            break;
        default:
            tUnit = "°C";
            wUnit = "m/s";
           
    }
    document.getElementById("locName").textContent = `${data.name}, ${data.sys.country}`;
    document.getElementById("dateTime").textContent = new Date().toLocaleString();
    document.getElementById("temperature").textContent = `${Math.round(data.main.temp)}${tUnit}`;
    document.getElementById("description").textContent = data.weather[0].description;
    document.getElementById("humidity").textContent = `Humidity: ${data.main.humidity}%`;
    document.getElementById("wind").textContent = `Wind: ${data.wind.speed} ${wUnit}`;
    document.getElementById("iconW").src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

    //set color
    pagecolor(unitDefault,data.main.temp);
    
   

    // const temp = data.main.temp;
    // const body = document.body;

    // // Remove old weather classes
    // body.classList.remove("cold", "cool", "warm", "hot");

    
    // //  temperature color
    
    // if (temp < 0) body.classList.add("cold");
    // else if (temp < 10) body.classList.add("cool");
    // else if (temp < 25) body.classList.add("warm");
    // else body.classList.add("hot");
     }
//update forcast container 
function hourlyfor(data) {
    const forecastContainer = document.getElementById("forecast");
    //const placeholder = forecastContainer.querySelectorAll(".card");
    forecastContainer.innerHTML = "";
   
    let tUnit, wUnit;
    switch (unitDefault) {
        case "imperial":
            tUnit = "°F";
            wUnit = "mph";
            break;
        case "standard":
            tUnit = "°K";
            wUnit = "m/s";
            break;
        default:
            tUnit = "°C";
            wUnit = "m/s";
    }

    // 8 × 3 entries  24 hour 
    const forecastItems = [];
for (let i = 0; i < 8 && i < data.list.length; i++) {
    forecastItems.push(data.list[i]);
}
    
    forecastItems.forEach(item => {
        console.log(item.dt);
        const time = new Date(item.dt * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        const temp = Math.round(item.main.temp);
        const icon = item.weather[0].icon;
        const wind = item.wind.speed;

       //create card for all entry 
        const card =document.createElement("div");
        card.className = "card p-2 text-center shadow-sm";
        card.style.width = "6.5rem";
        card.innerHTML = `
            <p class="small mb-1 fw-semibold">${time}</p>
            <p class="small mb-1 fw-semibold">${data.city.name}</p>
            <img src="https://openweathermap.org/img/wn/${icon}.png" alt="icon">
            <p class="mb-1">${temp}${tUnit}</p>
            <p class="text-muted small mb-0">W:${wind} ${wUnit}</p>
        `;
            
        forecastContainer.appendChild(card);
    });

   
}


function sevendayforcast(data){
     //console.log(data)
    const labels = [];
data.data_day.time.forEach(day => {
    labels.push(new Date(day).toLocaleDateString(undefined, { weekday: "short" }));
});
   let tempsMin = data.data_day.temperature_min;
  let tempsMax = data.data_day.temperature_max;
   let tUnit;
    switch (unitDefault) {
        case "imperial":
            tUnit = "°F";
           
            break;
        case "standard":
            tUnit = "°K";
            tempsMin.forEach((t, i) => {
                tempsMin[i] = t + 273;
            });
            tempsMax.forEach((t, i) => {
                tempsMax[i] = t + 273;
            });
            break;
        default:
            tUnit = "°C";
           
    }
 
   //from current card
    const city= document.getElementById("locName").textContent;
    //set up chart
  const chartData = {
    labels: labels,
    datasets: [
      {
        name: `Max Temp ${tUnit}`,
        type: "line",
        values: tempsMax
      },
      {
        name:  `Min Temp ${tUnit}`,
        type: "line",
        values: tempsMin
      }
    ]
  };
  //add to page
  const chart = new frappe.Chart("#chart", {
    title: `7-Day Temperature ${city}`,
    data: chartData,
    type: "line",
    height: 300,
    colors: ["#ff6b6b", "#6ec1e4"],
 
    lineOptions: {
      regionFill: 1
    },
    tooltipOptions: {
      formatTooltipY: d => `${d}${tUnit}`
    }
  });

}


//search 
document.getElementById("searchBtn").addEventListener("click", async () => {
    const city = document.getElementById("cityInput").value.trim();
    if (city) {
        fetchWeatherData("city", linkCurentw, city, null, unitDefault);
        fetchWeatherData("city", linkForw, city, null, unitDefault);
        fetchWeatherData("sevencity", null, city, null, unitDefault);
        //favourite
        addtopreSerch(city)
        document.getElementById("cityInput").value = "";
        
        
    } else {
        //no city was enterd
        alert("Please enter a city name.");
    }
});
//current
document.getElementById("locateBtn").addEventListener("click", currentLocation);

//previusly searched/Favourite
const preList = document.getElementById("preList");



function addtopreSerch(city) {
     //duplicates
    let inList=false;
    preSearch.forEach(c=>{
        if(c==city){
            inList=true
        }

    }) 
    if(!inList){
    preSearch.push(city);

   
    preList.innerHTML = ""; 

    // new dropdown list
    preSearch.forEach(c => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.className = "dropdown-item";
        //so it looks clickable
        a.href = "#";
        a.textContent = c;

        //  click
        a.addEventListener("click", () => {
           fetchWeatherData("city", linkCurentw, c, null, unitDefault);
        fetchWeatherData("city", linkForw, c, null, unitDefault);
        fetchWeatherData("sevencity", null, c, null, unitDefault);
        });

        li.appendChild(a);
        preList.appendChild(li);
    });
}
}

//initialize page
currentLocation()
