const f = document.getElementById("f");
const city = document.getElementById("city");
const unit = document.getElementById("unit");
const current = document.getElementById("current");
const forecast = document.getElementById("forecast");

f.addEventListener("submit", async (e) => {
  e.preventDefault();
  await fetchByCity(city.value.trim());
});

unit.addEventListener("change", () => {
  if (current.dataset.lat && current.dataset.lon) {
    fetchByCoords(Number(current.dataset.lat), Number(current.dataset.lon), current.dataset.place);
  }
});

document.getElementById("use-location").addEventListener("click", () => {
  if (!navigator.geolocation) return;
  current.textContent = "Locating...";
  navigator.geolocation.getCurrentPosition(
    (pos) => fetchByCoords(pos.coords.latitude, pos.coords.longitude, "Your location"),
    () => { current.textContent = "Location permission denied."; }
  );
});

async function fetchByCity(name) {
  if (!name) return;
  current.textContent = "Loading...";
  const geo = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1`).then((r) => r.json());
  if (!geo.results?.length) { current.textContent = "City not found."; forecast.innerHTML = ""; return; }
  const g = geo.results[0];
  fetchByCoords(g.latitude, g.longitude, `${g.name}, ${g.country}`);
}

async function fetchByCoords(lat, lon, place) {
  const tempUnit = unit.checked ? "fahrenheit" : "celsius";
  const windUnit = unit.checked ? "mph" : "kmh";
  const data = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=auto&temperature_unit=${tempUnit}&wind_speed_unit=${windUnit}`).then((r) => r.json());

  current.dataset.lat = lat;
  current.dataset.lon = lon;
  current.dataset.place = place;
  const c = data.current;
  const symbol = unit.checked ? "F" : "C";
  current.innerHTML = `<h2>${place}</h2><p>Temp: <strong>${c.temperature_2m}°${symbol}</strong> (feels ${c.apparent_temperature}°${symbol})</p><p>Wind: <strong>${c.wind_speed_10m}</strong> ${unit.checked ? "mph" : "km/h"}</p>`;

  const days = data.daily.time.slice(0, 3).map((d, i) => ({ date: d, max: data.daily.temperature_2m_max[i], min: data.daily.temperature_2m_min[i] }));
  forecast.innerHTML = "";
  days.forEach((d) => {
    const card = document.createElement("article");
    card.className = "day";
    card.innerHTML = `<h3>${new Date(d.date).toLocaleDateString(undefined,{weekday:"short"})}</h3><p>High: ${d.max}°${symbol}</p><p>Low: ${d.min}°${symbol}</p>`;
    forecast.appendChild(card);
  });
}