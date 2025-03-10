import React, { useState } from 'react';
import './App.css';
import './TaskTracker.css';
import { Dexie } from 'dexie';
import { useLiveQuery } from 'dexie-react-hooks';

const db = new Dexie('todoApp');
db.version(1).stores({
  todoLists: '++id,name', // New table for todo lists
  todos: '++id,task,completed,date,listId' // Add listId to associate todos with lists
});

const todos = db.table('todos');
const todoLists = db.table('todoLists');

const App = () => {
  const [selectedListId, setSelectedListId] = useState(null);
  const [newListName, setNewListName] = useState('');
  const allLists = useLiveQuery(() => todoLists.toArray(), []);
  const allItems = useLiveQuery(
    () => (selectedListId ? todos.where('listId').equals(selectedListId).toArray() : Promise.resolve([])),
    [selectedListId]
  );

  const addTask = async (event) => {
    event.preventDefault();
    const taskField = document.querySelector('#taskInput');

    if (!taskField.value.trim()) return; // Prevent adding empty tasks

    await todos.add({
      task: taskField.value,
      completed: false,
      listId: selectedListId // Associate with the selected list
    });

    taskField.value = '';
  };

  const deleteTask = async (id) => {
    await todos.delete(id);
  };

  const toggleStatus = async (id, event) => {
    await todos.update(id, { completed: !!event.target.checked });
  };

  const addList = async (event) => {
    event.preventDefault();
    if (newListName.trim() === '') return; // Prevent adding empty list names

    await todoLists.add({ name: newListName });

    setNewListName(''); // Clear the input field
  };

  const deleteList = async (id) => {
    const initialListId = 1; // Assuming the initial list has an id of 1
    if (id !== initialListId) {
      await todoLists.delete(id);
      if (selectedListId === id) setSelectedListId(null); // Clear selected list if deleted
    } else {
      alert("You cannot delete the initial todo list.");
    }
  };

  return (
    <div className="container">
      <h3 className="teal-text center-align">Todo App</h3>

      {/* New List Form */}
      <form onSubmit={addList}>
        <input
          type="text"
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          placeholder="New List Name"
          required
        />
        <button type="submit" className="waves-effect btn teal">
          Add Another List
        </button>
      </form>

      {/* List Selection */}
      <div>
        {allLists?.map(({ id, name }) => (
          <div key={id} className="list-item">
            <button onClick={() => setSelectedListId(id)}>{name}</button>
            <i
              className="material-icons delete-button"
              onClick={() => deleteList(id)}
              style={{ cursor: 'pointer', marginLeft: '10px' }}
            >
              delete
            </i>
          </div>
        ))}
      </div>

      {/* Task Input Form */}
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

      {/* Todo List */}
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
                  <span className={`black-text ${completed ? 'strike-text' : ''}`}>
                    {task}
                  </span>
                </label>
              </p>
              <i
                onClick={() => deleteTask(id)}
                className="col s2 material-icons delete-button"
                style={{ cursor: 'pointer' }}
              >
                delete
              </i>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;


