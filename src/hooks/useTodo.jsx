import React, { createContext } from 'react';

export const TodoContext = createContext({});

export const TodoProvider = ({ children }) => (
  <TodoContext.Provider value={{}}>
    {children}
  </TodoContext.Provider>
);