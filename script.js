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

async function getResults(entry) {
    try {
        const { data } = await axios(SEARCH_URL + entry)
        console.log(data);
        results = {
            data: data.items,
            length: data.items.length,
            current_index: 0,
            current_page: 1, 
            total_pages: Math.floor(data.items.length / PAGE_SIZE)
        }
        console.log(results);
        controls.style.visibility = 'visible'
        createCards()
        // createUserCard(data)
        // getRepos(username)
    } catch(err) {
        if(err.response.status == 404) {
            createErrorCard('No profile with this username')
        }
    }
}

async function getUser(username) {
    try {
        const { data } = await axios(USER_URL + username)
        console.log(data);
        createUserCard(data)
        getRepos(username)
    } catch(err) {
        if(err.response.status == 404) {
            createErrorCard('No profile with this username')
        }
    }
}

async function getRepos(username) {
    try {
        const { data } = await axios(USER_URL + username + '/repos?sort=created')
        console.log(data);
        // repo_list = {
        //     data: data,
        //     length: data.length,
        //     current_index: 0,
        //     current_page: 1
        // }
        addReposToCard(data, username)
    } catch(err) {
        console.log(err);
        createErrorCard('Problem fetching repos')
    }
}

function createCards() {
    main.innerHTML = ''
    for (let i = 0; i < PAGE_SIZE; i++) {
        // console.log(results.data[results.current_index + i].login);
        getUser(results.data[results.current_index + i].login) 
    }
}

function createUserCard(user) {
    console.log(user);
    const card = document.createElement('div')
    card.className = 'card'
    card.innerHTML = `
        
        <div>
        <img src="${user.avatar_url}" alt="${user.name}" class="avatar">
        </div>
        <div class="user-info">
        <h2>${user.name}</h2>
        <p>${user.bio}</p>
        <ul>
            <li>${user.followers} <strong>Followers</strong></li>
            <li>${user.following} <strong>Following</strong></li>
            <li>${user.public_repos} <strong>Repos</strong></li>
        </ul>
        <div id=${user.login}> <h4> Most recent repos </h4></div>
        
        </div>
        
    `
    main.appendChild(card)

    // setupControls()

    // <div id="controls">
    //     <button id="previous"><i class="fas fa-chevron-left"></i></button>
    //     <p id="page"> 1 </p>
    //     <button id="next"><i class="fas fa-chevron-right"></i></button>
    //   </div>

    card.addEventListener('click', () => {
        window.open(user.html_url)
    })
    
}

// function setupControls() {
//     const prev = document.getElementById("previous")
//     const next = document.getElementById("next")

    prev.addEventListener('click', () => {
        console.log("click previous");
        if(repo_list.current_index - PAGE_SIZE > -1) {
            repo_list.current_index -= PAGE_SIZE
            repo_list.current_page -= 1
            page.innerHTML = results.current_page
            createCards()
        }

    })

    next.addEventListener('click', () => {
        console.log("click next");
        
        if(results.current_index + PAGE_SIZE < results.length) {
            results.current_index += PAGE_SIZE
            results.current_page += 1
            page.innerHTML = results.current_page
            createCards()
        }
        
    })
// }

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
    // reposEl.innerHTML = '';

    // document.getElementById('page').innerHTML = repo_list.current_page

    if (repos.length > 0) {
        repos
        .slice(0, 5)
        .forEach(repo => {
            const repoEl = document.createElement('p')
            repoEl.classList.add('repo')
            // repoEl.href = repo.html_url
            // repoEl.target = '_blank'
            repoEl.innerText = repo.name

            reposEl.appendChild(repoEl)
        })
    }
}

form.addEventListener('submit', (e) => {
    e.preventDefault()
    main.innerHTML = ''
    
    const entry = search.value


    if(entry) {
        getResults(entry)

        search.value = ''
    }
})

// getUser('djoker07')