let userObject;
let data = [];
let box = ``;
const apiBaseURL = 'http://localhost:4000';

async function getDataFromBackend(endPoint) {
    data = await fetch(`${apiBaseURL}${endPoint}`);
    data = await data.json();
    return data;
}

async function sendDataToBackend(endPoint, method, data) {
    data = await fetch(`${apiBaseURL}${endPoint}`, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    data = await data.json();
    return data;
}

function saveUserData(userData) {
    localStorage.setItem('user', JSON.stringify(userData));
}

function getUserData() {
    const userData = localStorage.getItem('user');
    if (!userData) return false;

    return JSON.parse(userData);
}

function changeSection(currentSection, goingTo, sectionFunction) {
    $(currentSection).fadeOut(100, function () {
        sectionFunction();
        $(goingTo).fadeIn(1000);
    });
}

// * *************************************

// regiterUser();

// ****************************************
// * Register Section
// ****************************************
async function regiterUser() {
    userObject = getUserData();
    if (userObject) {
        console.log(userObject);
        changeSection('#register', '#home', home);
        return;
    }
    const username = $('#username');
    const email = $('#email');
    const password = $('#password');

    $('#submit').click(async function () {
        const data = {
            username: username.val(),
            email: email.val(),
            password: password.val(),
        };
        const response = await sendDataToBackend('/users', 'POST', data);
        if (response.error) {
            $('#invalid').html(response.error);
            $('#invalid').slideDown(500);
            return;
        }
        $('#invalid').slideUp(500);

        const user = response.user;
        saveUserData(user);
    });
}
regiterUser();

// ****************************************
// * Home Section
// ****************************************
async function home() {
    // * get un completed tasks from backend
    let tasksArr = await getDataFromBackend(
        `/todos/non-completed/${userObject.id}`
    );
    tasksArr = tasksArr.tasks;

    // * create tasks box
    for (let i = 0; i < tasksArr.length; i++) {
        box += `
        <div class="col-md-6 col-lg-4">
            <div class="bg-black bg-opacity-25 p-4">
                <h3>${tasksArr[i].title}</h3>
                <p class="text-white text-opacity-75">
                    ${tasksArr[i].description}
                </p>
                <hr />
                <div class="d-flex justify-content-between">
                    <div>
                        <button class="btn btn-outline-warning me-1">
                            Edit
                        </button>
                        <button class="btn btn-outline-danger">
                            Delete
                        </button>
                    </div>
                    <button class="btn btn-outline-success">
                        Done
                    </button>
                </div>
            </div>
        </div>
        
        `;
    }

    // * Display tasks
    $('#home').html(box);
}

// home();

// ****************************************
// * completedTasks Section
// ****************************************
async function completedTasks() {
    // * get un completed tasks from backend
    let completedTasksArr = await getDataFromBackend('/todos/completed');
    completedTasksArr = completedTasksArr.tasks;

    // * create tasks box
    for (let i = 0; i < completedTasksArr.length; i++) {
        box += `
        <div class="col-md-6 col-lg-4">
            <div class="bg-black bg-opacity-25 p-4">
                <h3>${completedTasksArr[i].title}</h3>
                <p class="text-white text-opacity-75">
                    ${completedTasksArr[i].description}
                </p>
                <hr />
                <div class="d-flex justify-content-between">
                    <div>
                        <button class="btn btn-outline-warning me-1">
                            Edit
                        </button>
                        <button class="btn btn-outline-danger">
                            Delete
                        </button>
                    </div>
                    <button class="btn btn-outline-success">
                        Done
                    </button>
                </div>
            </div>
        </div>
        
        `;
    }

    // * Display tasks
    $('#completedTasks').html(box);
}
// completedTasks();

// ****************************************
// * Tasks Actions
// ****************************************

// ****************************************
// * Add New Task Section
// ****************************************
