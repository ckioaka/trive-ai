import {
  doc, setDoc, getDoc, updateDoc,
  collection, addDoc, getDocs,
  query, orderBy, limit, deleteDoc,
  serverTimestamp
} from "firebase/firestore";
import { db } from "./config";

export const getUserData = async (uid) => {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
};

export const updateUserData = async (uid, data) => {
  await updateDoc(doc(db, "users", uid), data);
};

export const createConversation = async (uid, title) => {
  const ref = await addDoc(collection(db, "users", uid, "conversations"), {
    title: title || "Chat baru",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastMessage: "",
  });
  return ref.id;
};

export const getConversations = async (uid) => {
  const q = query(
    collection(db, "users", uid, "conversations"),
    orderBy("updatedAt", "desc"),
    limit(30)
  );
  const snap = await getDocs(q);
  return snap.docs.map(function(d) {
    return { id: d.id, ...d.data() };
  });
};

export const saveConversationMessage = async (uid, convId, message) => {
  await addDoc(collection(db, "users", uid, "conversations", convId, "messages"), {
    role: message.role,
    content: message.content,
    timestamp: serverTimestamp(),
  });
  await updateDoc(doc(db, "users", uid, "conversations", convId), {
    updatedAt: serverTimestamp(),
    lastMessage: message.content.slice(0, 80),
  });
};

export const getConversationMessages = async (uid, convId) => {
  const q = query(
    collection(db, "users", uid, "conversations", convId, "messages"),
    orderBy("timestamp", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map(function(d) {
    return { id: d.id, ...d.data() };
  });
};

export const deleteConversation = async (uid, convId) => {
  await deleteDoc(doc(db, "users", uid, "conversations", convId));
};