const searchInput = document.getElementById("searchInput")
const searchBtn = document.getElementById("searchBtn")
const resultSection = document.getElementById("mid")
const watchlistSection = document.getElementById("watchlist")

const apiKey = "16936e64"

if (watchlistSection) {
  document.addEventListener("DOMContentLoaded", () => {
    isEmpty()
    Object.keys(localStorage).forEach((key) => {
      const movieHtml = localStorage.getItem(key)
      watchlistSection.innerHTML += movieHtml
      const removeBtn = document.querySelector(`#${key} .itemBtn`)
      removeBtn.innerHTML = `<i class="fa-solid fa-circle-minus plusorminus"></i>Remove`
      removeBtn.setAttribute("onclick", `localstorageRemove('${key}')`)
    })
  })
}

//Adds the search function to the search button

if (searchBtn) {
  searchBtn.addEventListener("click", search)
}

//Why does this not work

document.addEventListener("keyup", (event) => {
  if (event.code === "Enter") {
    search()
  }
})

//FUNCTIONS//

async function search() {
  resetHtml()
  const movies = await getMovies()
  if (movies) {
    renderHtml(movies)
  }
  searchInput.value = ""
}

async function getMovies() {
  let searchTitle = searchInput.value
  const res = await fetch(`http://www.omdbapi.com/?apikey=${apiKey}&s=${searchTitle}&type=movie`)
  const data = await res.json()
  const movieList = data["Search"]
  let movies = []

  if (movieList === undefined) {
    resultSection.innerHTML = `
            <div id="placeholder-mid">
          <i class="fa-solid fa-film fa-5x" id="logoEl"></i>
          <p id="placeholderEl">No results, try again!</p>
        </div>
    `
    return
  }

  for (item of movieList) {
    let id = item["imdbID"]
    const res = await fetch(`http://www.omdbapi.com/?apikey=${apiKey}&i=${id}`)
    const movie = await res.json()
    movies.push(movie)
  }
  return movies
}

function renderHtml(movies) {
  for (let movie of movies) {
    let { Poster, Title, Runtime, Genre, Plot, imdbRating, imdbID } = movie
    if (Poster === "N/A") {
      Poster = "images/noImage2.jpg"
    }
    if (Plot === "N/A") {
      Plot = "No movie description available"
    }
    resultSection.innerHTML += `
    <div class="resultItem" id=${imdbID}>
      <div class="poster">
        <img src=${Poster}>
      </div>
      <div class="movie-info">
        <div class="titleRating">
          <h3>${Title}<span class="rating">
          <i class="fa-solid fa-star star"></i>${imdbRating}</span>
          </h3>
        </div>
        <div class="runtimeGenre">
          <p>${Runtime}</p>
          <p>${Genre}</p>
          <button class="itemBtn" onclick="localstorageAdd('${imdbID}', ${imdbID})"><i class="fa-solid fa-circle-plus plusorminus"></i>Watchlist</button>
        </div>
        <div class="plot line-clamp-4">
          <p onclick="togglePlot('${imdbID}')">${Plot}</p>
        </div>
      </div>
    </div>`
    if (Poster === "images/noImage2.jpg") {
      document.querySelector(`#${imdbID} .poster`).style.opacity = "0.1"
    }
    isTruncated(imdbID)
  }
}

function resetHtml() {
  //Resets html
  resultSection.innerHTML = ""
}

//Adds and removes from localStorage

function localstorageAdd(id, html) {
  console.log(id)
  console.log(html)
  localStorage.setItem(id, html.outerHTML)
  document.querySelector(`#${id} .itemBtn`).style.display = "none"
}

function localstorageRemove(id) {
  document.querySelector("#" + id).outerHTML = ""
  localStorage.removeItem(id)
  isEmpty()
}

//Shows more or less text & makes cursor pointer if text is truncated

function isTruncated(id) {
  let element = document.querySelector(`#${id} .plot p`)
  if (element.offsetHeight < element.scrollHeight || element.offsetWidth < element.scrollWidth) {
    element.style.cursor = "pointer"
  }
}

function togglePlot(id) {
  let element = document.querySelector(`#${id} .plot p`)
  element.parentElement.classList.toggle("line-clamp-4")
}

function isEmpty() {
  if (localStorage.length === 0) {
    watchlistSection.innerHTML = `
        <div id="placeholder-mid">
        <p id="placeholderEl">Your watchlist is looking a little empty...</p>
          <button class="itemBtn"><a href="index.html"><i class="fa-solid fa-circle-plus plusorminus"></i>Let's add some movies!</a></button>
        </div>
        `
  }
}
