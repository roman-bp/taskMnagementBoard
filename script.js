// Firebase конфигурация
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT_ID.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
  };
  
  // Инициализация Firebase
  firebase.initializeApp(firebaseConfig);
  const database = firebase.database();
  
  // Функция для сохранения задач в Firebase
  function saveTaskToFirebase(taskText, column) {
      const newTaskRef = database.ref('tasks').push();
      newTaskRef.set({
          text: taskText,
          column: column
      });
  }
  
  // Функция для загрузки задач из Firebase
  function loadTasksFromFirebase() {
      database.ref('tasks').on('value', (snapshot) => {
          const tasks = snapshot.val();
          for (let taskId in tasks) {
              const task = tasks[taskId];
              addTask(task.column, task.text);
          }
      });
  }
  
  // Загрузка задач при старте
  window.onload = () => {
      loadTasksFromFirebase();
  };
  
  // Функция для добавления новой задачи
  function addTask(column, taskText = null) {
      if (!taskText) {
          taskText = prompt("Введите название задачи:");
      }
  
      if (taskText) {
          const task = createTaskElement(taskText);
          document.getElementById(`${column}-tasks`).appendChild(task);
          saveTaskToFirebase(taskText, column);  
      }
  }
  
  // Создание элемента задачи
  function createTaskElement(taskText) {
      const task = document.createElement('div');
      task.classList.add('task');
      task.textContent = taskText;
      return task;
  }
  