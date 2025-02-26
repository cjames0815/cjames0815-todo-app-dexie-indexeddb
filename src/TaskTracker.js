import React from 'react';
import './App'
import Dexie from 'dexie';
import { useLiveQuery } from 'dexie-react-hooks';
import TaskTracker from './TaskTracker.css'; // Ensure this import is correct


const db = new Dexie('todoApp');
db.version(1).stores({
  todos: '++id,task,completed,date',
});

const App = () => {
  const allItems = useLiveQuery(() => db.todos.toArray(), []);

  const handleTaskAdd = async (taskName) => {
    await db.todos.add({
      task: taskName,
      completed: false,
    });
  };

  const handleTaskUpdate = async (taskId, updatedName) => {
    await db.todos.update(taskId, { task: updatedName });
  };

  const handleTaskDelete = async (taskId) => {
    await db.todos.delete(taskId);
  };

  const addTask = async (event) => {
    event.preventDefault();
    const taskField = document.querySelector('#taskInput');
    await handleTaskAdd(taskField.value);
    taskField.value = '';
  };

  const toggleStatus = async (id, event) => {
    await db.todos.update(id, { completed: !!event.target.checked });
  };

  return (
    <div className="container">
      <h3 className="teal-text center-align">Todo App</h3>
      <form className="add-item-form" onSubmit={addTask}>
        <input
          type="text"
          id="taskInput"
          className="itemField"
          placeholder="What do you want to do today?"
          required
        />
        <button type="submit" className="waves-effect btn teal right">
          Add
        </button>
      </form>

      <div className="card white darken-1">
        <div className="card-content">
          {allItems?.map(({ id, completed, task }) => (
            <div className="row" key={id}>
              <p className="col s10">
                <label>
                  <input
                    type="checkbox"
                    checked={completed}
                    className="checkbox-blue"
                    onChange={(event) => toggleStatus(id, event)}
                  />
                  <span className={`black-tex ${completed && 'strike-text'}`}>{task}</span>
                </label>
              </p>
              <i
                onClick={() => handleTaskDelete(id)}
                className="col s2 material-icons delete-button"
              >
                delete
              </i>
            </div>
          ))}
        </div>
      </div>

      <div className="app">
        <h1>Task Tracker</h1>
        <TaskTracker
          tasks={allItems} // Pass the live query result to TaskTracker
          onTaskAdd={handleTaskAdd}
          onTaskUpdate={handleTaskUpdate}
          onTaskDelete={handleTaskDelete}
        />
      </div>
    </div>
  );
};

export default App;
          