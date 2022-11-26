import NewTodoForm from "./NewTodoForm/NewTodoForm";
import TodoItem from "./TodoItem/TodoItem";
import styles from "./TodoList.module.less";
import React from "react";

const TodoList = ({ todos }) => {
  return (
    <div className={styles.container}>
      <header>
        <h1>Todo List</h1>
        <NewTodoForm />
      </header>
      <main>
        {todos.length ? (
          todos.map((todo) => <TodoItem key={todo.id} todo={todo} />)
        ) : (
          <p className={styles.noTodos}>No todos...</p>
        )}
      </main>
    </div>
  );
};

export default TodoList;
