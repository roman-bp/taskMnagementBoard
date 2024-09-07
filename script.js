let taskIdCounter = 0;

// Загрузка сохраненных задач при старте
window.onload = () => {
    loadTasks();
};

function addTask(column, taskText = null) {
    if (!taskText) {
        taskText = prompt("Введите название задачи:");
    }

    if (taskText) {
        const task = createTaskElement(taskText);
        document.getElementById(`${column}-tasks`).appendChild(task);
        saveTask(taskText, column);  // Сохранение задачи
    }
}

function createTaskElement(taskText) {
    const task = document.createElement('div');
    task.classList.add('task');
    task.id = `task-${taskIdCounter++}`;
    task.textContent = taskText;
    task.draggable = true;
    task.ondragstart = dragStart;

    return task;
}

function dragStart(event) {
    event.dataTransfer.setData('text', event.target.id);
}

document.querySelectorAll('.kanban-tasks').forEach(column => {
    column.ondragover = allowDrop;
    column.ondrop = drop;
});

function allowDrop(event) {
    event.preventDefault();
}

function drop(event) {
    event.preventDefault();
    const taskId = event.dataTransfer.getData('text');
    const task = document.getElementById(taskId);
    if (event.target.classList.contains('kanban-tasks')) {
        event.target.appendChild(task);
        updateTaskInStorage(task.textContent, event.target.id.split('-')[0]);  // Обновление местоположения задачи
    }
}

// Функции работы с localStorage

function saveTask(taskText, column) {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.push({ text: taskText, column });
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.forEach(task => {
        addTask(task.column, task.text);
    });
}

function updateTaskInStorage(taskText, newColumn) {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const task = tasks.find(t => t.text === taskText);
    if (task) {
        task.column = newColumn;
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
}
