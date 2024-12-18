class AttractionsManager {
  constructor(
    url,
    cardsContainerId,
    searchInputId,
    categoryFilterId,
    sortSelectId,
    regionFilterId,
    ratingFilterId,
    prevPageButtonId,
    nextPageButtonId,
    pageInfoId,
    loaderId
  ) {
    this.url = url;
    this.cardsContainer = document.getElementById(cardsContainerId);
    this.searchInput = document.getElementById(searchInputId);
    this.categoryFilter = document.getElementById(categoryFilterId);
    this.sortSelect = document.getElementById(sortSelectId);
    this.regionFilter = document.getElementById(regionFilterId);
    this.ratingFilter = document.getElementById(ratingFilterId);
    this.prevPageButton = document.getElementById(prevPageButtonId);
    this.nextPageButton = document.getElementById(nextPageButtonId);
    this.pageInfo = document.getElementById(pageInfoId);
    this.loader = document.getElementById(loaderId);
    this.isSignedIn = sessionStorage.getItem("sign") === "true";

    this.currentPage = 1;
    this.itemsPerPage = 10;
    this.totalItems = 100;
    this.currentPageAttractions = [];

    this.currentSearchTerm = "";
    this.currentCategory = "all";
    this.currentRegion = "all";
    this.currentRating = "all";
    this.currentSortBy = "";
    this.currentOrder = "";

    this.searchTimer = null;

    this.init();
  }

  init() {
    if (this.isSignedIn) {
      console.log("Пользователь авторизован");
      document.getElementById("sign").style.display = "none";
      document.getElementById("reg").style.display = "none";
    }

    this.searchInput.addEventListener(
      "input",
      this.handleSearchInput.bind(this)
    );

    this.searchInput.addEventListener(
      "keydown",
      this.handleSearchKeyDown.bind(this)
    );

    this.categoryFilter.addEventListener(
      "change",
      this.filterAttractions.bind(this)
    );
    this.regionFilter.addEventListener(
      "change",
      this.filterAttractions.bind(this)
    );
    this.ratingFilter.addEventListener(
      "change",
      this.filterAttractions.bind(this)
    );
    this.sortSelect.addEventListener(
      "change",
      this.filterAttractions.bind(this)
    );

    this.prevPageButton.addEventListener("click", this.prevPage.bind(this));
    this.nextPageButton.addEventListener("click", this.nextPage.bind(this));

    this.fetchAttractions(this.currentPage);
  }

  handleSearchInput() {
    clearTimeout(this.searchTimer);

    this.searchTimer = setTimeout(() => {
      this.filterAttractions();
    }, 500);
  }

  handleSearchKeyDown(event) {
    if (event.key === "Enter") {
      clearTimeout(this.searchTimer);
      this.filterAttractions();
    }
  }

  async fetchAttractions(
    page,
    searchTerm,
    category,
    region,
    rating,
    sortBy,
    order
  ) {
    try {
      this.loader.style.display = "flex";
      const urlWithParams = new URL(this.url);
      urlWithParams.searchParams.append("page", page);
      urlWithParams.searchParams.append("limit", this.itemsPerPage);

      if (searchTerm) urlWithParams.searchParams.append("search", searchTerm);
      if (category && category !== "all")
        urlWithParams.searchParams.append("category", category);
      if (region && region !== "all")
        urlWithParams.searchParams.append("region", region);
      if (rating && rating !== "all")
        urlWithParams.searchParams.append("rating", rating);
      if (sortBy) urlWithParams.searchParams.append("sortBy", sortBy);
      if (order) urlWithParams.searchParams.append("order", order);

      const response = await fetch(urlWithParams, { method: "GET" });

      if (!response.ok) {
        throw new Error(`Ошибка, статус ошибки: ${response.status}`);
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Данные не являются массивом");
      }

      this.currentPageAttractions = [];
      this.currentPageAttractions = data;

      this.currentPageAttractions.forEach((attraction) => {
        sessionStorage.setItem(attraction.id, JSON.stringify(attraction));
      });

      if (response.headers.has("X-Total-Count")) {
        this.totalItems = parseInt(response.headers.get("X-Total-Count"), 10);
      } else {
        this.totalItems = 100;
      }

      if (this.currentPageAttractions.length === 0) {
        this.displayNoAttractionsMessage();
      } else {
        this.displayAttractions(this.currentPageAttractions);
      }

      this.addPagination();
    } catch (error) {
      console.error("Ошибка при получении данных:", error);
      this.displayNoAttractionsMessage()
    } finally {
      this.loader.style.display = "none";
    }
  }

  displayAttractions(data) {
    this.cardsContainer.innerHTML = "";

    data.forEach((attraction) => {
      const card = document.createElement("div");
      card.className = "card";
      card.id = "card";

      card.innerHTML = `
              <img src="${attraction.image}" alt="${attraction.name}" style="height: 200px; width: 320px; border-radius: 7px;">
              <h2>${attraction.name}</h2>
              <p>${attraction.description}</p>
              <p><strong>Адрес:</strong> ${attraction.addres}</p>
              <p><strong>Регион:</strong> ${attraction.region}</p>
              <p><strong>Рейтинг:</strong> ${attraction.rating}</p>
          `;
      card.addEventListener("click", () => {
        window.location.href = `./info.html?id=${attraction.id}`;
      });

      this.cardsContainer.appendChild(card);
    });
  }

  displayNoAttractionsMessage() {
    this.cardsContainer.innerHTML = "";
    const noAttractionMessage = document.createElement("p");
    noAttractionMessage.textContent = "Достопримечательности не найдены";
    noAttractionMessage.style.fontSize = "1.5rem";
    noAttractionMessage.style.textAlign = "center";
    noAttractionMessage.style.marginTop = "20px";
    this.cardsContainer.appendChild(noAttractionMessage);
  }

  addPagination() {
    const totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    this.pageInfo.textContent = `Страница ${this.currentPage} из ${totalPages}`;

    this.prevPageButton.disabled = this.currentPage === 1;
    this.nextPageButton.disabled = this.currentPage === totalPages;
  }

  filterAttractions() {
    this.currentSearchTerm = this.searchInput.value.toLowerCase();
    this.currentCategory = this.categoryFilter.value;
    this.currentRegion = this.regionFilter.value;
    this.currentRating = this.ratingFilter.value;
    this.currentSortBy = this.sortSelect.value.split("-")[0];
    this.currentOrder = this.sortSelect.value.split("-")[1];

    this.currentPage = 1;
    this.fetchAttractions(
      this.currentPage,
      this.currentSearchTerm,
      this.currentCategory,
      this.currentRegion,
      this.currentRating,
      this.currentSortBy,
      this.currentOrder
    );
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.fetchAttractions(
        this.currentPage,
        this.currentSearchTerm,
        this.currentCategory,
        this.currentRegion,
        this.currentRating,
        this.currentSortBy,
        this.currentOrder
      );
    }
  }

  nextPage() {
    const totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    if (this.currentPage < totalPages) {
      this.currentPage++;
      this.fetchAttractions(
        this.currentPage,
        this.currentSearchTerm,
        this.currentCategory,
        this.currentRegion,
        this.currentRating,
        this.currentSortBy,
        this.currentOrder
      );
    }
  }
}

const attractionsManager = new AttractionsManager(
  "https://672b2e13976a834dd025f082.mockapi.io/travelguide/asd",
  "cardsContainer",
  "searchInput",
  "categoryFilter",
  "sortSelect",
  "regionFilter",
  "ratingFilter",
  "prevPage",
  "nextPage",
  "pageInfo",
  "preloader_malc"
);
