const SEARCH_URL = 'https://api.github.com/search/users?q='
const USER_URL = 'https://api.github.com/users/'
const PAGE_SIZE = 5

const main = document.getElementById('main')
const form = document.getElementById('form')
const search = document.getElementById('search')
const controls = document.getElementById('controls')
const prev = document.getElementById('previous')
const next = document.getElementById('next')
const page = document.getElementById('page')

let results = {
    current_page: 1
};

// FETCHING FUNCTIONS
async function getResults(entry) {
    try {
        const { data } = await axios(SEARCH_URL + entry)

        if(data.items.length !== 0) {

            results = {
                data: data.items,
                length: data.items.length,
                current_index: 0,
                current_page: 1, 
                total_pages: Math.floor(data.items.length / PAGE_SIZE)
            }
            if (results.length > PAGE_SIZE) {
                controls.style.visibility = 'visible'
                page.innerHTML = `${results.current_page} / ${results.total_pages}`
            }
            createCards()
        }
        else {
            createErrorCard("No users found")
        }

    } catch(err) {
        console.log(err);
        createErrorCard('Problem fetching profiles')
    }
}

async function getUser(username) {
    try {
        const { data } = await axios(USER_URL + username)
        createUserCard(data)
        getRepos(username)
    } catch(err) {
        if(err.response.status == 403) {
            createErrorCard('API Request Limit met, wait a few minutes and try again.')
        }
        if(err.response.status == 404) {
            createErrorCard('No profile with this username')
        }
    }
}

async function getRepos(username) {
    try {
        const { data } = await axios(USER_URL + username + '/repos?sort=created')
        addReposToCard(data, username)
    } catch(err) {
        if(err.response.status == 403) {
            createErrorCard('API Request Limit met, wait a few minutes and try again.')
        }
        else {
            // console.log(err);
            createErrorCard('Problem fetching repos')
        }
    }
}

// CONTENT CREATION
function createCards() {
    main.innerHTML = ''
    for (let i = 0; i < PAGE_SIZE; i++) {
        if(results.data[results.current_index + i]) {
            getUser(results.data[results.current_index + i].login) 
        }        
    }
}

function createUserCard(user) {
    const card = document.createElement('div')
    card.className = 'card'
    card.innerHTML = `
        
        <div>
            <img src="${user.avatar_url}" alt="${user.name}" class="avatar">
        </div>
        <div class="user-info">
            <h2>${user.name} - ${user.login} </h2>
            <p>${user.bio}</p>
            <ul>
                <li>${user.followers} <strong>Followers</strong></li>
                <li>${user.following} <strong>Following</strong></li>
                <li>${user.public_repos} <strong>Repos</strong></li>
            </ul>           
            <div id=${user.login}> <h4> Recent repos </h4></div>
        
        </div>
        
    `
    main.appendChild(card)

    card.addEventListener('click', () => {
        window.open(user.html_url)
    })
    
}

function createErrorCard(msg) {
    const cardHTML = `
        <div class="card">
            <h1>${msg}</h1>
        </div>
    `
    main.innerHTML = cardHTML
}

function addReposToCard(repos, username) {
    const reposEl = document.getElementById(username)

    if (repos.length > 0) {
        repos
        .slice(0, 5)
        .forEach(repo => {
            const repoEl = document.createElement('p')
            repoEl.classList.add('repo')
            repoEl.innerText = repo.name
            reposEl.appendChild(repoEl)
        })
    }
}

// EVENT LISTENERS
form.addEventListener('submit', (e) => {
    e.preventDefault()
    main.innerHTML = ''
    page.innerHTML = 1
    const entry = search.value

    if(entry) {
        getResults(entry)
        search.value = ''
    }
})

prev.addEventListener('click', () => {
    if(results.current_index - PAGE_SIZE > -1) {
        results.current_index -= PAGE_SIZE
        results.current_page -= 1
        page.innerHTML = `${results.current_page} / ${results.total_pages}`
        createCards()
    }

})

next.addEventListener('click', () => {  
    if(results.current_index + PAGE_SIZE < results.length) {
        results.current_index += PAGE_SIZE
        results.current_page += 1
        page.innerHTML = `${results.current_page} / ${results.total_pages}`
        createCards()
    }
    
})