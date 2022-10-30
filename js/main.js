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
    if (userData == null) return false;

    $('#navLinks').html(`
        <li class="nav-item">
            <a class="nav-link" onclick="window.location.reload()">Home</a>
        </li>
        <li class="nav-item">
            <a class="nav-link" id="completedTasksBtn">Completed Tasks</a>
        </li>
        <li class="nav-item">
            <a class="nav-link" id="logout">Logout</a>
        </li>
    `);

    return JSON.parse(userData);
}

function changeSection(currentSection, goingTo, sectionFunction) {
    $(currentSection).hide(1, function () {
        sectionFunction();
        $(goingTo).fadeIn(1000);
    });
}

// * *************************************

// ****************************************
// * Register Section
// ****************************************
async function regiterUser() {
    $('#navLinks').html(`
        <li class="nav-item">
            <a class="nav-link active" id="loginBtn">Login</a>
        </li>
    `);
    $('#loginBtn').click(function () {
        changeSection('#register', '#login', loginUser);
    });

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
        window.location.reload();

        return;
    });
}

// ****************************************
// * Login Section
// ****************************************
async function loginUser() {
    userObject = getUserData();
    if (userObject) {
        console.log(userObject);
        changeSection('#login', '#home', home);
        return;
    }

    $('#navLinks').html(`
        <li class="nav-item">
            <a class="nav-link active" id="registerBtn">Register</a>
        </li>
    `);
    $('#registerBtn').click(function () {
        changeSection('#login', '#register', regiterUser);
    });

    const email = $('#loginEmail');
    const password = $('#loginPassword');

    $('#submitLogin').click(async function () {
        const data = {
            email: email.val(),
            password: password.val(),
        };
        const response = await sendDataToBackend('/users/login', 'POST', data);
        if (response.error) {
            $('#invalid').html(response.error);
            $('#invalid').slideDown(500);
            return;
        }
        $('#invalid').slideUp(500);

        const user = response.user;
        saveUserData(user);
        window.location.reload();
        return;
    });
}
loginUser();

// ****************************************
// * Logout User
// ****************************************
$('#logout').click(function () {
    localStorage.removeItem('user');
    window.location.reload();
});

// ****************************************
// * Home Section
// ****************************************
async function home() {
    // * get un completed tasks from backend
    let tasksArr = await getDataFromBackend(
        `/todos/non-completed/${userObject.id}`
    );
    tasksArr = tasksArr.tasks;
    console.log(tasksArr);

    $('#completedTasksBtn').click(function () {
        changeSection('#home', '#completedTasks', completedTasks);
    });

    box = `
        <div class="d-flex justify-content-between align-items-center">
            <h1 class="mb-2 fw-bold">Tasks</h1> 
            <button class="btn btn-outline-info px-4" onclick="addNewTask('#home')">Add Task</button>
        </div>
    `;
    // * create tasks box
    for (let i = 0; i < tasksArr.length; i++) {
        box += `
        <div class="col-md-6 col-lg-4">
            <div class="task bg-black bg-opacity-25 p-4" >
                <h3>${tasksArr[i].title}</h3>
                <p class="text-white text-opacity-75">
                    ${tasksArr[i].description}
                </p>
                <hr />
                <div class="d-flex justify-content-between">
                    <div>
                        <button class="btn btn-outline-warning me-1" onclick="editTask(${tasksArr[i].id} , '#home')">
                            Edit
                        </button>
                        <button class="btn btn-outline-danger" onclick="deleteTask(${tasksArr[i].id})">
                            Delete
                        </button>
                    </div>
                    <button class="btn btn-outline-success" onclick="markTaskAsDone(${tasksArr[i].id})">
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

// ****************************************
// * completedTasks Section
// ****************************************
async function completedTasks() {
    $('#createTaskSection').fadeOut(100);
    $('#editTaskSection').fadeOut(100);

    // * get completed tasks from backend
    let completedTasksArr = await getDataFromBackend(
        `/todos/completed/${userObject.id}`
    );
    completedTasksArr = completedTasksArr.tasks;

    box = `<h1 class="mb-2 fw-bold">Completed Tasks</h1>`;
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
                <div>
                    <button class="btn btn-outline-warning me-1" onclick="editTask(${completedTasksArr[i].id} , '#home')">
                        Edit
                    </button>
                    <button class="btn btn-outline-danger" onclick="deleteTask(${completedTasksArr[i].id})">
                        Delete
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
async function addNewTask(prevSection) {
    $(prevSection).fadeOut(100, function () {
        $('#createTaskSection').fadeIn(1000);
    });

    const title = $('#title');
    const description = $('#description');

    $('#addTask').click(async function () {
        const data = {
            title: title.val(),
            description: description.val(),
            userId: userObject.id,
        };

        await sendDataToBackend('/todos', 'POST', data);
        window.location.reload();
    });
}

// ****************************************
// * Edit Task Section
// ****************************************
async function editTask(id, prevSection) {
    $(prevSection).fadeOut(100, function () {
        $('#editTaskSection').fadeIn(1000);
    });

    const taskTitle = $('#taskTitle');
    const taskDescription = $('#taskDescription');

    // * Get task id
    const response = await getDataFromBackend(`/todos/${userObject.id}/${id}`);
    const task = response.task;

    taskTitle.val(task.title);
    taskDescription.val(task.description);

    $('#updateTaskBtn').click(async function () {
        const data = {
            title: taskTitle.val(),
            description: taskDescription.val(),
            userId: userObject.id,
        };

        await sendDataToBackend(`/todos/${id}`, 'Put', data);

        window.location.reload();
    });
}

// ****************************************
// * delete Task
// ****************************************
async function deleteTask(id) {
    await sendDataToBackend(`/todos/${id}`, 'DELETE', data);
    window.location.reload();
}

// ****************************************
// * Mark Task As Done
// ****************************************
async function markTaskAsDone(id) {
    await sendDataToBackend(`/todos/done/${id}`, 'PUT', data);
    window.location.reload();
}
