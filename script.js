// Function to fetch tasks from the API
function fetchTasks() {
  fetch('http://localhost:3000/api/tasks') // Correct URL for fetching tasks
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json(); // Parse the response as JSON
    })
    .then(data => {
      console.log(data);
      
      // Populate the tasks into the HTML (e.g., append to task list)
      const taskList = document.getElementById('taskList');
      taskList.innerHTML = ''; // Clear existing tasks

      data.forEach(task => {
        const li = document.createElement('li');
        li.textContent = task.text;

        // Add a Toggle button to mark the task as completed
        const toggleButton = document.createElement('button');
        toggleButton.textContent = task.completed ? 'Mark Incomplete' : 'Mark Complete';
        toggleButton.style.backgroundColor = 'green'; // Optional: Style for the button
        toggleButton.addEventListener('click', () => {
          toggleTaskCompletion(task.id);  // Toggle task completion
        });

        // Add a Delete button to remove the task
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.style.backgroundColor = 'red'; // Optional: Style for the button
        deleteButton.addEventListener('click', () => {
          deleteTask(task.id);  // Delete task
        });

        // Append buttons to the list item
        li.appendChild(toggleButton);
        li.appendChild(deleteButton);

        // Append the list item to the task list
        taskList.appendChild(li);
      });
    })
    .catch(error => {
      console.error('Error fetching tasks:', error);
    });
}

// Function to add a new task (send POST request to API)
function addTask() {
  const taskInput = document.getElementById('taskInput');
  const taskText = taskInput.value.trim();

  if (taskText === '') return; // Don't add empty tasks

  const task = { text: taskText };

  // Send POST request to add the task
  fetch('http://localhost:3000/api/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(task),
  })
    .then(response => {
      if (response.ok) {
        console.log('Task added successfully');
        fetchTasks(); // Refresh task list
      } else {
        console.error('Failed to add task');
      }
    })
    .catch(error => {
      console.error('Error adding task:', error);
    });

  taskInput.value = ''; // Clear input field after adding task
}

// Function to delete a task (send DELETE request to API)
function deleteTask(taskId) {
  fetch(`http://localhost:3000/api/tasks/${taskId}`, {
    method: 'DELETE',
  })
    .then(response => {
      if (response.ok) {
        console.log('Task deleted successfully');
        fetchTasks(); // Refresh task list
      } else {
        console.error('Failed to delete task');
      }
    })
    .catch(error => {
      console.error('Error deleting task:', error);
    });
}

// Function to toggle task completion (send PATCH request to API)
function toggleTaskCompletion(taskId) {
  fetch(`http://localhost:3000/api/tasks/${taskId}/toggle`, {
    method: 'PATCH',
  })
    .then(response => {
      if (response.ok) {
        console.log('Task toggled successfully');
        fetchTasks(); // Refresh task list
      } else {
        console.error('Failed to toggle task');
      }
    })
    .catch(error => {
      console.error('Error toggling task:', error);
    });
}

// Call fetchTasks on page load to populate tasks
document.addEventListener('DOMContentLoaded', () => {
  fetchTasks();
});
