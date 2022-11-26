import React, { useEffect, useRef, useState } from "react";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { uploadFile } from "../../../utils/functions";
import styles from "./TodoItem.module.less";
import { db } from "../../../firebase";
import dayjs from "dayjs";

const TodoItem = ({ todo }) => {
  /**
   * @typedef Todo
   * @property {string} id
   * @property {string} completedAt
   * @property {string} status
   * @property {string} title
   * @property {string} description
   * @property {[any]} files
   */

  dayjs.extend(customParseFormat);

  const [open, setOpen] = useState(false);
  const [disabled, setDisabled] = useState(true);

  const [title, setTitle] = useState(todo.title);
  const [desc, setDesc] = useState(todo.description);
  const [date, setDate] = useState(dayjs(todo.completedAt, "DD.MM.YYYY").format("YYYY-MM-DD"));
  const [status, setStatus] = useState(todo.status);
  const [files, setFiles] = useState(todo.files);

  /**
   * Функция, возвращающая имя класса для стилизации задачи 
   * в зависимости от статуса.
   * @param {string} status строка, принимает значения "expired", "completed", "pending".
   * @returns {string} строковое имя класса.
   */
  const getTodoStyle = (status) => {
    switch (status) {
      case "expired":
        return styles.expired;
      case "completed":
        return styles.completed;
      case "pending":
        return styles.item;
      default:
        return styles.item;
    }
  };

  const todoStyle = getTodoStyle(todo.status);
  const inputRef = useRef(null);

  const openTodo = () => setOpen(!open);
  const handleSelect = (event) => setStatus(event.target.value);
  const handleDate = (event) => setDate(event.target.value);
  const handleDesc = (event) => setDesc(event.target.value);
  const handleTitle = (event) => setTitle(event.target.value);

  const handleEdit = (event) => {
    event.preventDefault();
    setDisabled(false);
  };

  /**
   * Обработчик события "click" для кнопки удаления. 
   * Удаляет документ из коллекции "todos".
   * @param {MouseEvent} event событие "click".
   */
  const removeTodo = async (event) => {
    event.stopPropagation();
    
    try {
      await deleteDoc(doc(db, "todos", String(todo.id)));
    } catch (error) {
      console.error(error);
    }
  };

  /**
   * Обработчик события "click" для кнопки сохранения. 
   * Обновляет документ в коллекции "todos".
   * @param {MouseEvent} event событие "click".
   */
  const updateTodo = async (event) => {
    event.preventDefault();

    try {
      const filesArr = [...inputRef.current.files];
      const todoRef = doc(db, "todos", String(todo.id));
      const filesSnaps = await Promise.all(filesArr.map((file) => uploadFile(file)));

      await updateDoc(todoRef, {
        title: title,
        description: desc,
        files: [...files, ...filesSnaps],
        completedAt: dayjs(date).format("DD.MM.YYYY"),
        status,
      });

      setDisabled(true);
      setFiles(filesSnaps);
    } catch (error) {
      console.error(error);
    }
    openTodo();
  };

  useEffect(() => {
    /**
     * Функция сравнивает дату завершения задачи с текущим временем 
     * пользователя и обновляет в документе ее статус.
     * @param {Todo} todo объект Todo.
     */
    const updateStatus = async (todo) => {
      try {
        const completionTime = dayjs(todo.completedAt, "DD.MM.YYYY").unix();
        const currentTime = dayjs().unix();

        if (todo.status !== "completed" && completionTime < currentTime) {
          await updateDoc(doc(db, "todos", todo.id), {
            status: "expired",
          });
        }
      } catch (error) {
        console.error(error);
      }
    };

    updateStatus(todo);
  }, [todo]);

  return (
    <div onClick={openTodo} className={todoStyle}>
      <div className={styles.row}>
        <div className={styles.start}>
          <p className={styles.title}>[{todo.title}]</p>
          <p className={styles.description}>{todo.description}</p>
        </div>
        <div className={styles.end}>
          <p>{todo.completedAt}</p>
          <button onClick={removeTodo} className={styles.removeButton}>X</button>
        </div>
      </div>
      {open && (
        <div className={styles.background}>
          <dialog
            onClick={(event) => event.stopPropagation()}
            open={open}
            className={styles.dialog}
          >
            <form onSubmit={updateTodo} className={styles.form}>
              <fieldset disabled={disabled} className={styles.field}>
                <label htmlFor="title">Заголовок</label>
                <input
                  id="title"
                  name="title"
                  value={title}
                  required
                  onChange={handleTitle}
                  type="text"
                  placeholder="Название..."
                />
              </fieldset>
              <fieldset disabled={disabled} className={styles.field}>
                <label className={styles.files} htmlFor="files">
                  Прикрепленные файлы:
                </label>
                <div>
                  {files.length ? (
                    files.map((file) => (
                      <div key={file.id} className={styles.fileRow}>
                        <a rel="noreferrer" target={"_blank"} href={file.url}>{file.name}</a>
                        <p>{file.size}KB</p>
                      </div>
                    ))
                  ) : (
                    <p>Нет</p>
                  )}
                </div>
                <input
                  className={styles.hidden}
                  ref={inputRef}
                  type="file"
                  multiple
                  id="files"
                  name="files"
                />
              </fieldset>
              <fieldset disabled={disabled} className={styles.field}>
                <label htmlFor="date">Дата завершения</label>
                <input
                  id="date"
                  name="date"
                  value={date}
                  required
                  onChange={handleDate}
                  type="date"
                />
              </fieldset>
              <fieldset disabled={disabled} className={styles.field}>
                <label htmlFor="description">Описание</label>
                <textarea
                  id="description"
                  name="description"
                  value={desc}
                  onChange={handleDesc}
                  placeholder="Описание..."
                />
              </fieldset>
              <fieldset disabled={disabled} className={styles.field}>
                <label htmlFor="status">Статус</label>
                <select
                  onChange={handleSelect}
                  value={status}
                  name="status"
                  id="status"
                >
                  <option value="expired">Просрочена</option>
                  <option value="completed">Выполнена</option>
                  <option value="pending">В процессе</option>
                </select>
              </fieldset>
              {disabled ? (
                <button onClick={handleEdit} className={styles.editButton}>
                  Редактировать
                </button>
              ) : (
                <button type="submit" className={styles.saveButton}>
                  Сохранить
                </button>
              )}
            </form>
          </dialog>
        </div>
      )}
    </div>
  );
};

export default TodoItem;
