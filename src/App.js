import { collection, onSnapshot } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import TodoList from "./components/TodoList/TodoList";
import styles from "./App.module.less";
import { db } from "./firebase";

const App = () => {
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    const todosRef = collection(db, "todos");

    const unsubscribe = onSnapshot(todosRef, (data) => {
      const { docs: todos } = data;
      const mappedTodos = todos.map((todo) => todo.data());

      setTodos(mappedTodos);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className={styles.container}>
      <TodoList todos={todos} />
    </div>
  );
};

export default App;
