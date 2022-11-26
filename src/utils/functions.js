import { getDownloadURL, ref, uploadBytes } from "firebase/storage"
import { storage } from "../firebase";

export const uploadFile = async (file) => {
  const fileRef = ref(storage, `files/${Date.now()} - ${file.name}`);
  const snap = await uploadBytes(fileRef, file);
  const fileUrl = await getDownloadURL(ref(storage, snap.ref.fullPath));

  return {
    name: file.name,
    size: Math.ceil(file.size / 1024 * 100) / 100,
    url: fileUrl,
    id: `${file.lastModified}-${file.name}`
  }
}