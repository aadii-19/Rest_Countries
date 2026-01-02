function search() {
  const query = document.getElementById("search-input").value.trim();
  const type = document.getElementById("search-type").value;

  if (!query) {
    return loadAllCountriesOnLoad();
  }

  fetchCountries(type, query);
}

const container = document.getElementById("countries-container");
const pagination = document.getElementById("pagination");

let allCountries = [];
let currentPage = 1;
const itemsPerPage = 16;

async function loadAllCountriesOnLoad() {
  try {
    document.getElementById("message").textContent = "Loading countries...";
    container.innerHTML = "";
    pagination.innerHTML = "";

    const regions = ["asia", "europe", "africa", "americas", "oceania"];
    allCountries = [];

    for (const region of regions) {
      const response = await fetch(
        `https://restcountries.com/v3.1/region/${region}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch region: " + region);
      }

      const data = await response.json();
      allCountries = allCountries.concat(data);
    }

    //sort the merged list
    allCountries.sort((a, b) => {
      const nameA = a.name?.common.toLowerCase() || "";
      const nameB = b.name?.common.toLowerCase() || "";
      return nameA.localeCompare(nameB);
    });

    document.getElementById("message").textContent = ""; //clear the loading...
    // console.log(allCountries);

    currentPage = 1;
    renderCountries();
    renderPagination();
  } catch (error) {
    console.error(error);
    document.getElementById("message").textContent = "Failed to load countries";
  }
}

async function fetchCountries(type, query) {
  try {
    document.getElementById("message").textContent = "Loading...";
    container.innerHTML = "";
    pagination.innerHTML = "";

    let url = "";

    if (type === "name") {
      url = `https://restcountries.com/v3.1/name/${encodeURIComponent(query)}`;
    } else if (type === "code") {
      url = `https://restcountries.com/v3.1/alpha/${encodeURIComponent(query)}`;
    } else if (type === "capital") {
      url = `https://restcountries.com/v3.1/capital/${encodeURIComponent(
        query
      )}`;
    } else if (type === "region") {
      url = `https://restcountries.com/v3.1/region/${encodeURIComponent(
        query
      )}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("No data found");
    }

    const data = await response.json();
    console.log(data);
    document.getElementById("message").textContent = "";

    allCountries = data;
    currentPage = 1;
    renderCountries();
    renderPagination();
  } catch (error) {
    document.getElementById("message").textContent = "No countries found!";
  }
}

function renderCountries() {
  container.innerHTML = ""; //clear any previous

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageCountries = allCountries.slice(startIndex, endIndex);

  pageCountries.forEach((country) => {
    const div = document.createElement("div");
    div.classList.add("country-card");

    div.onclick = () => showCountryDetails(country);

    const flag = country.flags?.png || "";
    const name = country.name?.common || "N/A";
    const code = country.cca2 || "N/A";
    const capital = country.capital ? country.capital[0] : "N/A";
    const region = country.region || "N/A";

    div.innerHTML = `
      <img src="${flag}" width="120">
      <h3>${name}</h3>
      <p><b>Code:</b> ${code}</p>
      <p><b>Capital:</b> ${capital}</p>
      <p><b>Region:</b> ${region}</p>
    `;

    container.appendChild(div);
  });
}

function renderPagination() {
  pagination.innerHTML = "";

  const totalPages = Math.ceil(allCountries.length / itemsPerPage);

  for (let i = 1; i <= totalPages; i++) {   //closure remembers
    const btn = document.createElement("button");
    btn.textContent = i;

    if (i === currentPage) {
      btn.classList.add("active");
    }

    btn.onclick = () => {
      currentPage = i;
      renderCountries();
      renderPagination();
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    pagination.appendChild(btn);
  }
}

function showCountryDetails(country) {
  const modal = document.getElementById("country-modal");
  const body = document.getElementById("modal-body");

  const name = country.name?.common || "N/A";
  const flag = country.flags?.png || "";
  const capital = country.capital ? country.capital[0] : "N/A";
  const region = country.region || "N/A";
  const subregion = country.subregion || "N/A";
  const population = country.population || "N/A";

  const languages = country.languages
    ? Object.values(country.languages).join(", ")
    : "N/A";

  const currency = country.currencies
    ? Object.values(country.currencies)[0].name
    : "N/A";

  body.innerHTML = `
    <h2 class="modal-title">${name}</h2>

    <div class="modal-layout">
      <div class="modal-details">
        <p><b>Capital:</b> ${capital}</p>
        <p><b>Region:</b> ${region}</p>
        <p><b>Sub-Region:</b> ${subregion}</p>
        <p><b>Population:</b> ${population}</p>
        <p><b>Languages:</b> ${languages}</p>
        <p><b>Currency:</b> ${currency}</p>
      </div>

      <img src="${flag}" alt="Flag of ${name}">
    </div>
  `;

  modal.style.display = "flex";
}

function closeModal() {
  document.getElementById("country-modal").style.display = "none";
}

loadAllCountriesOnLoad();

const themeBtn = document.getElementById("theme-btn");
const body = document.body;

// Load saved theme
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
  body.classList.add("dark-mode");
  themeBtn.textContent = "☀️ Light Mode";
}

// Toggle theme
themeBtn.onclick = () => {
  body.classList.toggle("dark-mode");

  if (body.classList.contains("dark-mode")) {
    localStorage.setItem("theme", "dark");
    themeBtn.textContent = "☀️ Light Mode";
  } else {
    localStorage.setItem("theme", "light");
    themeBtn.textContent = "🌙 Dark Mode";
  }
};

