import { useEffect, useState } from "react";
import axios from 'axios';

function App() {
  const [newTodo, setnewTodo] = useState("");
  const [todos, setTodos] = useState([]);
  const [editedTodo, seteditedTodo] = useState(null);
  const [editedtext, seteditedtext] = useState("");

  const API_URL = '/api/v1/todos';

  const fetchTodo = async () => {
    try {
      const response = await axios.get(API_URL);
      setTodos(response.data);
    } catch (error) {
      console.error("error in fetching todo", error);
    }
  };

  const addTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    
    try {
      const response = await axios.post(API_URL, { text: newTodo });
      setTodos([...todos, response.data]); // Fixed function invocation
      setnewTodo('');
    } catch (error) {
      console.error("error in adding todo", error);
    }
  };

  const saveEdit = async (id) => {
    try {
      const response = await axios.patch(`${API_URL}/${id}`, { text: editedtext }); // Fixed template literal
      setTodos(todos.map((todo) => (todo._id == id ? response.data : todo)));
      seteditedTodo(null);
    } catch (error) {
      console.error("error updating todo", error);
    }
  };

  const toggleTodo = async (id) => {
    try {
      const todo = todos.find((t) => t._id == id);
      const response = await axios.patch(`${API_URL}/${id}`, { completed: !todo.completed }); // Fixed URL & backticks
      setTodos(todos.map((t) => (t._id == id ? response.data : t))); // Fixed typo: response.data
    } catch (error) {
      console.error("error toggling todo", error);
    }
  };

  const startediting = (todo) => {
    seteditedTodo(todo._id); // Fixed function call
    seteditedtext(todo.text); // Fixed function call
  };

  const deletedTodo = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setTodos(todos.filter((todo) => todo._id !== id)); // Fixed _id property check
    } catch (error) {
      console.error("error deleting todo", error);
    }
  };

  useEffect(() => {
    fetchTodo();
  }, []); // Fixed dependency array placement

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-xl font-bold mb-4 text-center">Task Manager</h1>

        <form onSubmit={addTodo} className="flex gap-2 mb-4">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setnewTodo(e.target.value)}
            placeholder="what to be done?"
            className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Add task
          </button>
        </form>

        <div>
          {todos.length === 0 ? (
            <div className="text-center text-gray-500 py-4">All Done 🎉</div>
          ) : (
            <div className="space-y-2">
              {todos.map((todo) => (
                <div key={todo._id} className="p-2 border rounded-md flex items-center justify-between">
                  {editedTodo === todo._id ? (
                    <div className="flex gap-2 w-full">
                      <input
                        type="text"
                        value={editedtext}
                        onChange={(e) => seteditedtext(e.target.value)}
                        className="flex-1 px-2 py-1 border rounded-md"
                      />
                      <button onClick={() => saveEdit(todo._id)} className="px-2 py-1 bg-green-500 text-white rounded">
                        Save
                      </button>
                      <button onClick={() => seteditedTodo(null)} className="px-2 py-1 bg-gray-400 text-white rounded">
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => toggleTodo(todo._id)}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${
                            todo.completed
                              ? 'bg-green-500 border-green-500 text-white'
                              : 'border-gray-400 text-transparent hover:border-green-500'
                          }`}
                        >
                          ✓
                        </button>
                        <span className={todo.completed ? 'line-through text-gray-400' : 'text-gray-800'}>
                          {todo.text}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => startediting(todo)} className="px-2 py-1 bg-amber-500 text-white rounded text-xs">
                          Edit
                        </button>
                        <button onClick={() => deletedTodo(todo._id)} className="px-2 py-1 bg-red-500 text-white rounded text-xs">
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;