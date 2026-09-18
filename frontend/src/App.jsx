import { useEffect, useState } from "react";
import axios from 'axios';

function App() {
  const [newTodo, setnewTodo] = useState("");
  const [todos, setTodos] = useState([]);
  const [editedTodo, seteditedTodo] = useState(null);
  const [editedtext, seteditedtext] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || '/api/v1/todos'

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
  const text = newTodo.trim();
  if (!text) return;

  const tempId = `temp-${Date.now()}`;

  // 1. Instant UI update & input clear
  setnewTodo('');
  setTodos((prev) => [...prev, { _id: tempId, text, completed: false }]);

  try {
    // 2. Background POST & replace temp ID with real MongoDB ID
    const res = await axios.post(API_URL, { text });
    const saved = res.data.data || res.data;
    setTodos((prev) => prev.map((t) => (t._id === tempId ? saved : t)));
  } catch (error) {
    // 3. Rollback list & restore typed text on failure
    setTodos((prev) => prev.filter((t) => t._id !== tempId));
    setnewTodo(text);
  }
};

  const saveEdit = async (id) => {
  const newText = editedtext.trim();
  if (!newText) return;

  const previousTodos = [...todos];

  // 1. Close edit mode & update UI text instantly
  seteditedTodo(null);
  setTodos((prev) =>
    prev.map((t) => (t._id === id ? { ...t, text: newText } : t))
  );

  try {
    // 2. Send background PATCH request
    await axios.patch(`${API_URL}/${id}`, { text: newText });
  } catch (error) {
    console.error("Error updating todo, rolling back:", error);
    // 3. Rollback to original text on failure
    setTodos(previousTodos);
  }
};

  const toggleTodo = async (id) => {
    const previousTodos = [...todos]
    setTodos((prev) =>
    prev.map((t) => (t._id === id ? { ...t, completed: !t.completed } : t))
  )
    try {
      const todo = previousTodos.find((t) => t._id === id);
      await axios.patch(`${API_URL}/${id}`, { completed: !todo.completed })
    } catch (error) {
      console.error("error toggling todo", error);
      onsole.error("error toggling todo, rolling back", error);
      setTodos(previousTodos);
    }
  };

  const startediting = (todo) => {
    seteditedTodo(todo._id); // Fixed function call
    seteditedtext(todo.text); // Fixed function call
  };

  const deletedTodo = async (id) => {
    const previousTodos = [...todos]
    setTodos((prev) => prev.filter((t) => t._id !== id))
    try {
    await axios.delete(`${API_URL}/${id}`);
  } catch (error) {
    setTodos(previousTodos);
  }
  };

  useEffect(() => {
    fetchTodo();
  }, []); // Fixed dependency array placement

  return (
  <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans">
    <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
      <h1 className="text-2xl font-extrabold mb-6 text-center text-gray-800 tracking-tight">
        Task Manager
      </h1>

      <form onSubmit={addTodo} className="flex gap-2 mb-6">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setnewTodo(e.target.value)}
          placeholder="What needs to be done?"
          className="flex-1 min-w-0 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />
        <button
          type="submit"
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all shrink-0 shadow-sm active:scale-95"
        >
          Add
        </button>
      </form>

      <div>
        {todos.length === 0 ? (
          <div className="text-center text-gray-400 py-8 text-sm font-medium">
            🎉 All tasks completed!
          </div>
        ) : (
          <div className="space-y-2.5">
            {todos.map((todo) => (
              <div
                key={todo._id}
                className="p-3 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-3 min-w-0"
              >
                {editedTodo === todo._id ? (
                  /* EDIT MODE FORM */
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      saveEdit(todo._id);
                    }}
                    className="flex items-center gap-2 w-full min-w-0"
                  >
                    <input
                      type="text"
                      value={editedtext}
                      onChange={(e) => seteditedtext(e.target.value)}
                      className="flex-1 min-w-0 w-full px-3 py-1.5 border border-blue-400 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shrink-0 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => seteditedTodo(null)}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs font-semibold shrink-0 transition-colors"
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  /* VIEW MODE ROW */
                  <div className="flex items-center justify-between w-full min-w-0 gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={() => toggleTodo(todo._id)}
                        className={`w-5 h-5 shrink-0 rounded-full border flex items-center justify-center text-[10px] font-bold transition-all ${
                          todo.completed
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-gray-300 text-transparent hover:border-emerald-500'
                        }`}
                      >
                        ✓
                      </button>
                      <span
                        className={`text-sm break-all min-w-0 ${
                          todo.completed
                            ? 'line-through text-gray-400'
                            : 'text-gray-700 font-medium'
                        }`}
                      >
                        {todo.text}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => startediting(todo)}
                        className="px-2.5 py-1 text-amber-600 hover:bg-amber-50 rounded-lg text-xs font-semibold transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deletedTodo(todo._id)}
                        className="px-2.5 py-1 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold transition-colors"
                      >
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
)
}

export default App;