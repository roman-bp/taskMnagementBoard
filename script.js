window.onload = function() {
    // Вставь свою конфигурацию Firebase ниже
    const firebaseConfig = {
        apiKey: "AIzaSyDk2SzrlhfMdhcC76lKhVNiNZg-qTNJt0s",
        authDomain: "taskcat-b47fc.firebaseapp.com",
        projectId: "taskcat-b47fc",
        storageBucket: "taskcat-b47fc.appspot.com",
        messagingSenderId: "606721842068",
        appId: "1:606721842068:web:9025cec629b135d4314d81",
        measurementId: "G-3L4CTPS1MQ"
    };
  
    // Инициализация Firebase
    firebase.initializeApp(firebaseConfig);
    const database = firebase.database();
  
    // Функция для добавления новой задачи
    function addNewTask(column) {
        const taskText = prompt("Введите название задачи:");
        if (taskText) {
            const taskRef = database.ref('tasks').push();
            taskRef.set({
                text: taskText,
                column: column
            });
        }
    }
  
    // Функция для загрузки задач из Firebase
    function loadTasks() {
        const tasksRef = database.ref('tasks');
        tasksRef.on('value', (snapshot) => {
            const tasks = snapshot.val();
            clearTasks();  // Очищаем колонки перед обновлением
            for (let id in tasks) {
                const task = tasks[id];
                addTaskToBoard(task.text, task.column, id);
            }
        });
    }
  
    // Функция для очистки задач на доске перед загрузкой новых
    function clearTasks() {
        document.getElementById('planned-tasks').innerHTML = '';
        document.getElementById('in-progress-tasks').innerHTML = '';
        document.getElementById('completed-tasks').innerHTML = '';
    }
  
    // Функция для добавления задачи на доску
    function addTaskToBoard(taskText, column, taskId) {
        const task = document.createElement('div');
        task.classList.add('task');
        task.textContent = taskText;
        task.draggable = true;
        task.id = taskId;
        task.ondragstart = dragStart;
  
        document.getElementById(`${column}-tasks`).appendChild(task);
    }
  
    // Логика для перетаскивания
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
        const newColumn = event.target.id.split('-')[0];
        event.target.appendChild(task);
  
        // Обновление данных задачи в Firebase
        const taskRef = database.ref('tasks/' + taskId);
        taskRef.update({
            column: newColumn
        });
    }
  
    // Привязка событий к элементам после загрузки страницы
    document.querySelectorAll('.kanban-tasks').forEach(column => {
        column.ondragover = allowDrop;
        column.ondrop = drop;
    });
  
    // Загружаем задачи при загрузке страницы
    loadTasks();
  };
  