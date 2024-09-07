window.onload = function() {
    // Вставте свою конфігурацію Firebase нижче
    const firebaseConfig = {
        apiKey: "AIzaSyDk2SzrlhfMdhcC76lKhVNiNZg-qTNJt0s",
        authDomain: "taskcat-b47fc.firebaseapp.com",
        projectId: "taskcat-b47fc",
        databaseURL: "https://taskcat-b47fc-default-rtdb.europe-west1.firebasedatabase.app",
        messagingSenderId: "606721842068",
        appId: "1:606721842068:web:92e527fa6013d36a314d81",
        measurementId: "G-VHR0WVKS9Z"
    };

    // Ініціалізація Firebase
    firebase.initializeApp(firebaseConfig);
    const database = firebase.database();

    // Прив'язуємо функцію до кнопки після повного завантаження сторінки
    document.getElementById('add-planned-task').onclick = function() {
        addNewTask('planned');
    };

    // Функція для додавання нової задачі
    function addNewTask(column) {
        const taskText = prompt("Введіть назву задачі:");
        if (taskText) {
            const taskRef = database.ref('tasks').push();
            taskRef.set({
                text: taskText,
                column: column
            });
        }
    }

    // Функція для завантаження задач з Firebase
    function loadTasks() {
        const tasksRef = database.ref('tasks');
        tasksRef.on('value', (snapshot) => {
            const tasks = snapshot.val();
            clearTasks();  // Очищуємо колонки перед оновленням
            for (let id in tasks) {
                const task = tasks[id];
                addTaskToBoard(task.text, task.column, id);
            }
        });
    }

    // Функція для очищення задач на дошці перед завантаженням нових
    function clearTasks() {
        document.getElementById('planned-tasks').innerHTML = '';
        document.getElementById('in-progress-tasks').innerHTML = '';
        document.getElementById('completed-tasks').innerHTML = '';
    }

    // Функція для додавання задачі на дошку
    function addTaskToBoard(taskText, column, taskId) {
        const task = document.createElement('div');
        task.classList.add('task');
        task.textContent = taskText;
        task.draggable = true;
        task.id = taskId;
        task.ondragstart = dragStart;

        // Упевнюємось, що колонка існує, і додаємо задачу
        const columnElement = document.getElementById(`${column}-tasks`);
        if (columnElement) {
            columnElement.appendChild(task);
        } else {
            console.error(`Колонка ${column} не знайдена.`);
        }
    }

    // Логіка для перетягування
    function dragStart(event) {
        event.dataTransfer.setData('text', event.target.id);
    }

    function allowDrop(event) {
        event.preventDefault();
    }

    function drop(event) {
        event.preventDefault();
        const taskId = event.dataTransfer.getData('text');
        const task = document.getElementById(taskId);

        // Перевіряємо, чи задача переноситься в правильний контейнер (kanban-tasks)
        if (event.target.classList.contains('kanban-tasks')) {
            const newColumn = event.target.id.replace('-tasks', '');  // Правильно обробляємо ID колонки
            event.target.appendChild(task);

            // Оновлення даних задачі в Firebase
            const taskRef = database.ref('tasks/' + taskId);
            taskRef.update({
                column: newColumn
            });
        } else {
            console.error(`Колонка ${event.target.id} не знайдена.`);
        }
    }

    // Прив'язка подій до елементів після завантаження сторінки
    document.querySelectorAll('.kanban-tasks').forEach(column => {
        column.ondragover = allowDrop;
        column.ondrop = drop;
    });

    // Завантажуємо задачі при завантаженні сторінки
    loadTasks();
};
