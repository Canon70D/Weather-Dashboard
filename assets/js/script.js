function initPage() {
    //var created to access HTML
    var city = document.getElementById("enterCity");
    var search = document.getElementById("searchBtn");
    var cityName = document.getElementById("cityName");
    var weatherLogo = document.getElementById("cityWeatherPic");
    var currentTemp = document.getElementById("Temp");
    var currentHumidity = document.getElementById("Humidity");
    var currentWind = document.getElementById("Wind");
    var currentUV = document.getElementById("UV");
    var historyEl = document.getElementById("history");
    var searchHistory = JSON.parse(localStorage.getItem("search")) || [];

    //APT key 
    var APIKey = "c3589302f59bc28a8f9879cf3476f20d";

    //weather display main function
    function getWeather(location) {
        //assign API call link
        var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + location + "&appid=" + APIKey;
        //credit to https://attacomsian.com/blog/axios-javascript, another way to do APT call
        axios.get(queryURL)
            .then(function (response) {
                //current weather display
                var currentDate = new Date(response.data.dt * 1000);
                var day = currentDate.getDate();
                var month = currentDate.getMonth() + 1;
                var year = currentDate.getFullYear();
                cityName.innerHTML = response.data.name + " ("+ day +  "/" + month + "/" + year + ") ";

                var weatherPic = response.data.weather[0].icon;
                weatherLogo.setAttribute("src", "https://openweathermap.org/img/wn/" + weatherPic + "@2x.png");
                currentTemp.innerHTML = "Temperature: " + k2f(response.data.main.temp) + " &#176F";
                currentWind.innerHTML = "Wind Speed: " + response.data.wind.speed + " MPH";
                currentHumidity.innerHTML = "Humidity: " + response.data.main.humidity + "%";
                
                //UV call
                var lat = response.data.coord.lat;
                var lon = response.data.coord.lon;
                var UVQueryURL = "https://api.openweathermap.org/data/2.5/uvi/forecast?lat=" + lat + "&lon=" + lon + "&appid=" + APIKey + "&cnt=1";
                axios.get(UVQueryURL)
                    .then(function (response) {
                        var UVIndex = document.createElement("span");
                        //UV color display by level
                        if (response.data[0].value < 4 ) {
                            UVIndex.setAttribute("class", "uv-low");
                        } else if (response.data[0].value < 8) {
                            UVIndex.setAttribute("class", "uv-mid");
                        } else {
                            UVIndex.setAttribute("class", "uv-high");
                        }
                        UVIndex.innerHTML = response.data[0].value;
                        currentUV.innerHTML = "UV Index: ";
                        currentUV.append(UVIndex);
                    });
                
                //5 days forecast
                var cityID = response.data.id;
                var forecastQueryURL = "https://api.openweathermap.org/data/2.5/forecast?id=" + cityID + "&appid=" + APIKey;
                axios.get(forecastQueryURL)
                    .then(function (response) {
                        var forecastEls = document.querySelectorAll(".forecast");
                        for (i = 0; i < forecastEls.length; i++) {
                            forecastEls[i].innerHTML = "";
                            var forecastIndex = i * 8 + 4;
                            var forecastDate = new Date(response.data.list[forecastIndex].dt * 1000);
                            var forecastDay = forecastDate.getDate();
                            var forecastMonth = forecastDate.getMonth() + 1;
                            var forecastYear = forecastDate.getFullYear();
                            var forecastDateEl = document.createElement("p");
                            forecastDateEl.setAttribute("class", "mt-3 mb-0 forecast-date");
                            forecastDateEl.innerHTML = forecastMonth + "/" + forecastDay + "/" + forecastYear;
                            forecastEls[i].append(forecastDateEl);
                            
                            //console.log(response.data.list);

                            //weather display
                            var forecastWeatherEl = document.createElement("img");
                            forecastWeatherEl.setAttribute("src", "https://openweathermap.org/img/wn/" + response.data.list[forecastIndex].weather[0].icon + "@2x.png");
                            forecastWeatherEl.setAttribute("alt", response.data.list[forecastIndex].weather[0].description);
                            forecastEls[i].append(forecastWeatherEl);
                            //temp
                            var forecastTempEl = document.createElement("p");
                            forecastTempEl.innerHTML = "Temp: " + k2f(response.data.list[forecastIndex].main.temp) + " &#176F";
                            forecastEls[i].append(forecastTempEl);
                            //wind speed
                            var forecastWindEl = document.createElement("p");
                            forecastWindEl.innerHTML = "Wind Speed: " + response.data.list[forecastIndex].wind.speed + " MPH";
                            forecastEls[i].append(forecastWindEl);
                            //humidity
                            var forecastHumidityEl = document.createElement("p");
                            forecastHumidityEl.innerHTML = "Humidity: " + response.data.list[forecastIndex].main.humidity + "%";
                            forecastEls[i].append(forecastHumidityEl);

                        }
                    })
            });
    }

    //temperature unit exchange
    function k2f(K) {
        return Math.floor((K - 273.15) * 1.8 + 32);
    }

    //search history save to local storage
    search.addEventListener("click", function () {
        var searchInput = city.value;
        getWeather(searchInput);
        searchHistory.push(searchInput);
        localStorage.setItem("search", JSON.stringify(searchHistory));
        renderSearchHistory();
    })

    //search history display
    function renderSearchHistory() {
        historyEl.innerHTML = "";
        for (var i = 0; i < searchHistory.length; i++) {
            const historyDsp = document.createElement("input");
            historyDsp.setAttribute("type", "text");
            historyDsp.setAttribute("readonly", true);
            historyDsp.setAttribute("class", "form-control d-block bg-white");
            historyDsp.setAttribute("value", searchHistory[i]);
            historyDsp.addEventListener("click", function () {
                getWeather(historyDsp.value);
            })
            historyEl.append(historyDsp);
        }
    }
    
    renderSearchHistory();
}

//----------------------------------------------
initPage();