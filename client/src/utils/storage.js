const STORAGE_KEY = 'tone-picker-data';
const MAX_HISTORY_SIZE = 50;

export const saveToLocalStorage = (data) => {
  try {
    const limitedHistory = data.history.slice(-MAX_HISTORY_SIZE);
    
    const storageData = {
      text: data.text || '',
      history: limitedHistory,
      currentIndex: Math.min(data.currentIndex, limitedHistory.length - 1),
      timestamp: Date.now()
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
    try {
      localStorage.clear();
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        text: data.text || '',
        history: [],
        currentIndex: -1,
        timestamp: Date.now()
      }));
    } catch (clearError) {
      console.error('Failed to clear localStorage:', clearError);
    }
  }
};

export const loadFromLocalStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const data = JSON.parse(stored);
    
    if (!data || typeof data !== 'object') {
      return null;
    }

    return {
      text: data.text || '',
      history: Array.isArray(data.history) ? data.history : [],
      currentIndex: typeof data.currentIndex === 'number' ? data.currentIndex : -1,
      timestamp: data.timestamp || Date.now()
    };
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return null;
  }
};

export const clearLocalStorage = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear localStorage:', error);
  }
};

export const getStorageInfo = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return {
        size: 0,
        historyCount: 0,
        lastSaved: null
      };
    }

    const data = JSON.parse(stored);
    return {
      size: stored.length,
      historyCount: Array.isArray(data.history) ? data.history.length : 0,
      lastSaved: data.timestamp ? new Date(data.timestamp) : null
    };
  } catch (error) {
    console.error('Failed to get storage info:', error);
    return {
      size: 0,
      historyCount: 0,
      lastSaved: null
    };
  }
};

export const isLocalStorageAvailable = () => {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (error) {
    return false;
  }
};

export const exportData = (data) => {
  try {
    const exportData = {
      ...data,
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tone-picker-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export data:', error);
    throw new Error('Failed to export data');
  }
};

export const importData = async (file) => {
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid file format');
    }

    return {
      text: data.text || '',
      history: Array.isArray(data.history) ? data.history : [],
      currentIndex: typeof data.currentIndex === 'number' ? data.currentIndex : -1
    };
  } catch (error) {
    console.error('Failed to import data:', error);
    throw new Error('Failed to import data: ' + error.message);
  }
};
