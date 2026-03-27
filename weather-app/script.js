"use strict";
(() => {
    const f = document.getElementById("f");
    const city = document.getElementById("city");
    const unit = document.getElementById("unit");
    const current = document.getElementById("current");
    const hourly = document.getElementById("hourly");
    const forecast = document.getElementById("forecast");
    const useLocationBtn = document.getElementById("use-location");
    const LAST_SEARCH_KEY = "weather_pro_last_search_v1";
    if (f && city && unit && current && hourly && forecast && useLocationBtn) {
        f.addEventListener("submit", async (e) => {
            e.preventDefault();
            await fetchByCity(city.value.trim());
        });
        unit.addEventListener("change", async () => {
            if (current.dataset.lat && current.dataset.lon) {
                await fetchByCoords(Number(current.dataset.lat), Number(current.dataset.lon), current.dataset.place || "");
            }
        });
        useLocationBtn.addEventListener("click", () => {
            if (!navigator.geolocation) {
                setError("Geolocation is not supported in this browser.");
                return;
            }
            setLoading("Locating...");
            navigator.geolocation.getCurrentPosition((pos) => void fetchByCoords(pos.coords.latitude, pos.coords.longitude, "Your location"), () => setError("Location permission denied."));
        });
        restoreLastSearch();
    }
    async function fetchByCity(name) {
        if (!name)
            return;
        try {
            setLoading("Loading city...");
            const geo = await fetchJson(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1`);
            if (!geo.results?.length) {
                setError("City not found.");
                clearPanels();
                return;
            }
            const g = geo.results[0];
            localStorage.setItem(LAST_SEARCH_KEY, g.name);
            await fetchByCoords(g.latitude, g.longitude, `${g.name}, ${g.country}`);
        }
        catch {
            setError("Unable to fetch city data. Please try again.");
            clearPanels();
        }
    }
    async function fetchByCoords(lat, lon, place) {
        try {
            setLoading("Loading weather...");
            const tempUnit = unit?.checked ? "fahrenheit" : "celsius";
            const windUnit = unit?.checked ? "mph" : "kmh";
            const data = await fetchJson(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,wind_speed_10m,relative_humidity_2m&hourly=temperature_2m,precipitation_probability&daily=temperature_2m_max,temperature_2m_min&timezone=auto&temperature_unit=${tempUnit}&wind_speed_unit=${windUnit}`);
            if (!data?.current || !data?.hourly || !data?.daily)
                throw new Error("Invalid payload");
            if (current) {
                current.dataset.lat = String(lat);
                current.dataset.lon = String(lon);
                current.dataset.place = place;
            }
            renderCurrent(data, place);
            renderHourly(data);
            renderForecast(data);
        }
        catch {
            setError("Unable to fetch weather right now.");
            clearPanels();
        }
        finally {
            setLoadingState(false);
        }
    }
    function renderCurrent(data, place) {
        if (!current)
            return;
        const symbol = unit?.checked ? "F" : "C";
        const c = data.current;
        current.innerHTML = `
    <h2>${place}</h2>
    <p>Temp: <strong>${c.temperature_2m}°${symbol}</strong> (feels ${c.apparent_temperature}°${symbol})</p>
    <p>Humidity: <strong>${c.relative_humidity_2m}%</strong></p>
    <p>Wind: <strong>${c.wind_speed_10m}</strong> ${unit?.checked ? "mph" : "km/h"}</p>
  `;
    }
    function renderHourly(data) {
        if (!hourly)
            return;
        const symbol = unit?.checked ? "F" : "C";
        const nowIdx = data.hourly.time.findIndex((t) => t === data.current.time);
        const start = nowIdx >= 0 ? nowIdx : 0;
        const hours = data.hourly.time.slice(start, start + 6).map((t, i) => ({
            time: t,
            temp: data.hourly.temperature_2m[start + i],
            rain: data.hourly.precipitation_probability[start + i]
        }));
        hourly.innerHTML = "";
        hours.forEach((h) => {
            const card = document.createElement("article");
            card.className = "hour";
            const label = new Date(h.time).toLocaleTimeString([], { hour: "numeric" });
            card.innerHTML = `<strong>${label}</strong><p>${h.temp}°${symbol}</p><p>${h.rain ?? 0}% rain</p>`;
            hourly.appendChild(card);
        });
    }
    function renderForecast(data) {
        if (!forecast)
            return;
        const symbol = unit?.checked ? "F" : "C";
        const days = data.daily.time.slice(0, 5).map((d, i) => ({
            date: d,
            max: data.daily.temperature_2m_max[i],
            min: data.daily.temperature_2m_min[i]
        }));
        forecast.innerHTML = "";
        days.forEach((d) => {
            const card = document.createElement("article");
            card.className = "day";
            card.innerHTML = `<h3>${new Date(d.date).toLocaleDateString(undefined, { weekday: "short" })}</h3><p>High: ${d.max}°${symbol}</p><p>Low: ${d.min}°${symbol}</p>`;
            forecast.appendChild(card);
        });
    }
    function setLoading(message) {
        setLoadingState(true);
        if (current)
            current.innerHTML = `<p>${message}</p>`;
    }
    function setError(message) {
        if (current)
            current.innerHTML = `<p>${message}</p>`;
        setLoadingState(false);
    }
    function setLoadingState(isLoading) {
        const submit = f?.querySelector("button[type='submit']");
        if (submit)
            submit.disabled = isLoading;
        if (useLocationBtn)
            useLocationBtn.disabled = isLoading;
    }
    function clearPanels() {
        if (hourly)
            hourly.innerHTML = "";
        if (forecast)
            forecast.innerHTML = "";
    }
    function restoreLastSearch() {
        const last = localStorage.getItem(LAST_SEARCH_KEY);
        if (!last || !city)
            return;
        city.value = last;
        void fetchByCity(last);
    }
    async function fetchJson(url) {
        const response = await fetch(url);
        if (!response.ok)
            throw new Error(`Request failed: ${response.status}`);
        return response.json();
    }
})();
