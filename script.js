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

    document.getElementById('add-planned-task').onclick = function() {
        addNewTask('planned');
    };

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

    function loadTasks() {
        const tasksRef = database.ref('tasks');
        tasksRef.on('value', (snapshot) => {
            const tasks = snapshot.val();
            clearTasks();  
            for (let id in tasks) {
                const task = tasks[id];
                addTaskToBoard(task.text, task.column, id);
            }
        });
    }

    function clearTasks() {
        document.getElementById('planned-tasks').innerHTML = '';
        document.getElementById('in-progress-tasks').innerHTML = '';
        document.getElementById('completed-tasks').innerHTML = '';
    }

    function addTaskToBoard(taskText, column, taskId) {
        const task = document.createElement('div');
        task.classList.add('task');
        task.textContent = taskText;
        task.draggable = true;
        task.id = taskId;
        task.ondragstart = dragStart;

        if (column === 'completed') {
            const deleteButton = document.createElement('button');
            deleteButton.innerHTML = '&times;';
            deleteButton.onclick = function() {
                deleteTask(taskId);
            };
            task.appendChild(deleteButton);
        }

        const columnElement = document.getElementById(`${column}-tasks`);
        if (columnElement) {
            columnElement.appendChild(task);
        } else {
            console.error(`Колонка ${column} не знайдена.`);
        }

        // Добавляем поддержку touch-событий
        task.addEventListener('touchstart', touchStart);
        task.addEventListener('touchmove', touchMove);
        task.addEventListener('touchend', touchEnd);
    }

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

        if (event.target.classList.contains('kanban-tasks')) {
            const newColumn = event.target.id.replace('-tasks', '');
            event.target.appendChild(task);

            const taskRef = database.ref('tasks/' + taskId);
            taskRef.update({
                column: newColumn
            });
        } else {
            console.error(`Колонка ${event.target.id} не знайдена.`);
        }
    }

    function deleteTask(taskId) {
        const taskRef = database.ref('tasks/' + taskId);
        taskRef.remove().then(() => {
            const taskElement = document.getElementById(taskId);
            taskElement.remove();
        }).catch((error) => {
            console.error("Помилка при видаленні:", error);
        });
    }

    // Поддержка touch-событий для мобильных устройств
    function touchStart(event) {
        event.target.dataset.dragging = event.target.id;
    }

    function touchMove(event) {
        event.preventDefault();
        const touch = event.touches[0];
        const task = document.querySelector(`[data-dragging="${event.target.dataset.dragging}"]`);
        if (task) {
            task.style.position = 'absolute';
            task.style.left = `${touch.pageX - task.offsetWidth / 2}px`;
            task.style.top = `${touch.pageY - task.offsetHeight / 2}px`;
        }
    }

    function touchEnd(event) {
        const taskId = event.target.dataset.dragging;
        delete event.target.dataset.dragging;

        const task = document.getElementById(taskId);
        const dropTarget = document.elementFromPoint(event.changedTouches[0].clientX, event.changedTouches[0].clientY);

        if (dropTarget && dropTarget.classList.contains('kanban-tasks')) {
            const newColumn = dropTarget.id.replace('-tasks', '');
            dropTarget.appendChild(task);

            const taskRef = database.ref('tasks/' + taskId);
            taskRef.update({
                column: newColumn
            });
        }
    }

    document.querySelectorAll('.kanban-tasks').forEach(column => {
        column.ondragover = allowDrop;
        column.ondrop = drop;
    });

    loadTasks();
};
