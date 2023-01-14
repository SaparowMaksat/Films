document.addEventListener('DOMContentLoaded', start);
let FILMS = [];
const STORAGE_KEY = 'films';

function getAllFilms() {
    const URL = 'https://www.omdbapi.com/?s=marvel&apikey=9b67fc54';
    fetch(URL)
        .then((response) => response.json())
        .then((data) => {
            const formatData = formatResponse(data);
            FILMS = formatData;
            renderFilms();
        });
}

function formatResponse(data) {
    return data.Search.map((film) => {
        const filmsFromStorage = getFromLocalStorage(STORAGE_KEY);
        const liked = !!filmsFromStorage[film.imdbID]?.liked;
        return {
            ...film,
            id: film.imdbID,
            liked,
        };
    });
}

function renderFilms() {
    const isLikes = new URLSearchParams(window.location.search).get('likes');
    const filmId = window.location.hash.split('/')[1];

    if (filmId) {
        renderFilmDetail(filmId);
        return;
    }

    const filmsEl = document.querySelector('.films');

    if (!filmsEl) {
        return;
    }

    const filmsToRender = FILMS
        .filter((film) => {
            if (isLikes) {
                return film.liked;
            }

            return true;
        });

    filmsEl.innerHTML = '';

    if (filmsToRender.length === 0) {
        filmsEl.innerHTML = "<div class='empty'>Empty Here</div>"
    } else {
        filmsEl.innerHTML = FILMS
            .filter((film) => {
                if (isLikes) {
                    return film.liked;
                }

                return true;
            })
            .map((film) => {
                const imageUrl = film.liked ? './images/like.png' : './images/unLike.png';

                return (`
            <div class="card" onclick="onLike(event)">
                <img class="card__image"
                    src="${film.Poster}" />
                <a href="./detail.html#detail/${film.id}" class="card__title">
                    ${film.Title}
                </a>
                <p class="card__year">${film.Year}</p>
                <button class="card__like-btn" data-film-id="${film.id}">
                    <img class="card__like-img" src="${imageUrl}" />
                </button>
            </div>`
                );
            }).join('');
    }
}

function renderFilmDetail(filmId) {
    const foundFilm = FILMS.find((film) => film.id === filmId);
    const filmDetailEl = document.querySelector('.filmDetail');

    if (filmDetailEl) {
        filmDetailEl.innerHTML = '';

        if (foundFilm) {
            const imageUrl = foundFilm.liked ? './images/like.png' : './images/unLike.png';
            filmDetailEl.innerHTML = `
                <div class="card" onclick="onLike(event)">
                    <img class="card__image"
                        src="${foundFilm.Poster}" />
                    <a href="./detail.html#detail/${foundFilm.id}" class="card__title">
                        ${foundFilm.Title}
                    </a>
                    <p class="card__year">${foundFilm.Year}</p>
                    <button class="card__like-btn" data-film-id="${foundFilm.id}">
                        <img class="card__like-img" src="${imageUrl}" />
                    </button>
                    <a href="./index.html" class="backLink">
                        Back To All Films
                    </a>
                </div>
            `
        } else {
            filmDetailEl.innerHTML = `
                <div class="notFound">
                    <p>Film Not Found</p>      
                    <a href="./index.html">
                      See All Films
                    </a>          
                </div>
            `;
        }
    }
}

function onLike(event) {
    const target = event.target;
    const parent = target.parentElement;

    if (parent.dataset.filmId) {
        const filmId = parent.dataset.filmId;

        FILMS = FILMS.map((film) => {
            if (film.id === filmId) {
                return {
                    ...film,
                    liked: !film.liked,
                };
            }
            return film;
        });
        renderFilms();

        const filmsFromStorage = getFromLocalStorage(STORAGE_KEY);
        const foundFilm = FILMS.find(({ id }) => id === filmId);

        if (foundFilm) {
            const newFilms = {
                ...filmsFromStorage,
                [filmId]: {
                    ...foundFilm,
                    liked: foundFilm.liked,
                },
            };
            setLocalStorage(STORAGE_KEY, newFilms);
        }
    }
}

function setLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function getFromLocalStorage(key, format = '{}') {
    return JSON.parse(localStorage.getItem(key) || format);
}


function start() {
    getAllFilms();
    renderFilms();
}
