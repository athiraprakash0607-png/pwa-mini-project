import { supabase } from './supabase';

const DB_NAME = 'shoppify_offline_db';
const STORE_NAME = 'offline_orders';

export const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
    
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
};

export const saveOfflineOrder = async (orderData) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add({ ...orderData, timestamp: Date.now() });
    
    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
};

export const getOfflineOrders = async () => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const clearOfflineOrder = async (id) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);
    
    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
};

export const syncOfflineOrders = async () => {
  if (!navigator.onLine) return { synced: 0, failed: 0 };
  
  const orders = await getOfflineOrders();
  let syncedCount = 0;
  let failedCount = 0;
  
  for (const order of orders) {
    try {
      // Remove local ID and timestamp before syncing
      const { id, timestamp, ...syncData } = order;
      const { error } = await supabase.from('orders').insert([syncData]);
      
      if (!error) {
        await clearOfflineOrder(id);
        syncedCount++;
      } else {
        failedCount++;
      }
    } catch (err) {
      failedCount++;
    }
  }
  
  return { synced: syncedCount, failed: failedCount };
};
