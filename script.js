window.onload = function() {
    const firebaseConfig = {
        apiKey: "AIzaSyDk2SzrlhfMdhcC76lKhVNiNZg-qTNJt0s",
        authDomain: "taskcat-b47fc.firebaseapp.com",
        projectId: "taskcat-b47fc",
        databaseURL: "https://taskcat-b47fc-default-rtdb.europe-west1.firebasedatabase.app",
        messagingSenderId: "606721842068",
        appId: "1:606721842068:web:92e527fa6013d36a314d81",
        measurementId: "G-VHR0WVKS9Z"
    };

    firebase.initializeApp(firebaseConfig);
    const database = firebase.database();

    // Додавання нової задачі
    document.getElementById('add-planned-task').onclick = function() {
        addNewTask('planned');
    };

    // Додавання нової задачі
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

    // Завантаження задач з Firebase
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

    // Очищення колонок перед оновленням
    function clearTasks() {
        document.getElementById('planned-tasks').innerHTML = '';
        document.getElementById('in-progress-tasks').innerHTML = '';
        document.getElementById('completed-tasks').innerHTML = '';
    }

    // Додавання задачі на дошку
    function addTaskToBoard(taskText, column, taskId) {
        const task = document.createElement('div');
        task.classList.add('task');
        task.textContent = taskText;
        task.draggable = true;
        task.id = taskId;
        task.ondragstart = dragStart;

        // Додаємо хрестик для задач у колонці "Завершено"
        if (column === 'completed') {
            const deleteButton = document.createElement('button');
            deleteButton.innerHTML = '&times;'; // Хрестик
            deleteButton.style.position = 'absolute';
            deleteButton.style.top = '-10px';
            deleteButton.style.right = '-150px';
            deleteButton.style.background = 'none';
            deleteButton.style.border = 'none';
            deleteButton.style.color = 'white';
            deleteButton.style.fontSize = '18px';
            deleteButton.onclick = function() {
                deleteTask(taskId);
            };
            task.appendChild(deleteButton);
        }

        // Додаємо задачу в правильну колонку
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

        // Перевіряємо, чи задача переноситься в правильну колонку
        if (event.target.classList.contains('kanban-tasks')) {
            const newColumn = event.target.id.replace('-tasks', '');
            event.target.appendChild(task);

            // Оновлюємо дані задачі в Firebase
            const taskRef = database.ref('tasks/' + taskId);
            taskRef.update({
                column: newColumn
            });
        } else {
            console.error(`Колонка ${event.target.id} не знайдена.`);
        }
    }

    // Функція для видалення задачі
    function deleteTask(taskId) {
        const taskRef = database.ref('tasks/' + taskId);
        taskRef.remove().then(() => {
            const taskElement = document.getElementById(taskId);
            taskElement.remove();  // Видалення з інтерфейсу
        }).catch((error) => {
            console.error("Помилка при видаленні:", error);
        });
    }

    // Прив'язка подій до елементів після завантаження сторінки
    document.querySelectorAll('.kanban-tasks').forEach(column => {
        column.ondragover = allowDrop;
        column.ondrop = drop;
    });

    // Завантаження задач при завантаженні сторінки
    loadTasks();
};
