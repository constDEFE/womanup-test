import React, { useRef, useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { uploadFile } from "../../../utils/functions";
import { db } from "../../../firebase";
import styles from "./NewTodoForm.module.less";
import dayjs from "dayjs";

const NewTodoForm = () => {
  const [open, setOpen] = useState(false);

  const nameRef = useRef(null);
  const filesRef = useRef(null);
  const descRef = useRef(null);
  const dateRef = useRef(null);

  const handleOpen = () => setOpen(!open);

  /**
   * Обработчик события "click" для кнопки добавления. 
   * Создает новую задачу и добавляет документ в коллекцию "todos".
   * @param {MouseEvent} event 
   */
  const createTodo = async (event) => {
    event.preventDefault();

    try {
      const id = String(dayjs().unix());
      const files = await Promise.all([...filesRef.current.files].map((file) => uploadFile(file)));
  
      await setDoc(doc(db, "todos", id), {
        id,
        title: nameRef.current.value,
        description: descRef.current.value,
        files,
        completedAt: dayjs(dateRef.current.value).format("DD.MM.YYYY"),
        status: "pending",
      });
    } catch (error) {
      console.error(error);
    }

    handleOpen();
  };

  return (
    <div>
      <button onClick={handleOpen} className={styles.addButton}>Добавить</button>
      {open && (
        <div onClick={handleOpen} className={styles.background}>
          <dialog
            open={open}
            onClick={(event) => event.stopPropagation()}
            className={styles.dialog}
          >
            <form onSubmit={createTodo} className={styles.form}>
              <fieldset className={styles.field}>
                <label htmlFor="title">Название</label>
                <input
                  required
                  ref={nameRef}
                  type="text"
                  name="title"
                  id="title"
                  placeholder="Название..."
                />
              </fieldset>
              <fieldset className={styles.field}>
                <label htmlFor="files">Файлы</label>
                <input
                  ref={filesRef}
                  type="file"
                  multiple
                  name="files"
                  id="files"
                />
              </fieldset>
              <fieldset className={styles.field}>
                <label htmlFor="date">Дата завершения</label>
                <input
                  required
                  ref={dateRef}
                  min={dayjs().format("YYYY-MM-DD")}
                  type="date"
                  id="date"
                  name="date"
                />
              </fieldset>
              <fieldset className={styles.field}>
                <label htmlFor="description">Описание</label>
                <textarea
                  ref={descRef}
                  id="description"
                  name="description"
                  placeholder="Описание..."
                />
              </fieldset>
              <button className={styles.addButton}>Добавить</button>
            </form>
          </dialog>
        </div>
      )}
    </div>
  );
};

export default NewTodoForm;
