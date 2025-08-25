// type Serializable = string | number | boolean | null | object;

export const setLocalStorage = (key: string, item: string) => {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, item);
    }
  } catch (error) {
    console.log(error);
  }
};

export const getLocalStorage = (key: string) => {
  try {
    if (typeof window !== "undefined") {
      const value = localStorage.getItem(key);
      if (!value || value === "undefined") {
        return null;
      }
      return value;
    }
    return null;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const removeLocalStorage = (key: string) => {
  try {
    if (typeof window !== "undefined") {
      localStorage.removeItem(key);
    }
  } catch (error) {
    console.log(error);
  }
};
