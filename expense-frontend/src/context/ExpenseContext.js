import { createContext, useState, useContext } from "react";
import API from "../services/api";

export const ExpenseContext = createContext();

export const ExpenseProvider = ({ children }) => {
  const [expenses, setExpenses] = useState([]);
  const [income, setIncome] = useState([]);

  const fetchExpenses = async () => {
    try {
      const res = await API.get("/expenses");
      setExpenses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const addExpense = async (data) => {
    const res = await API.post("/expenses/add", data);
    return res.data;
  };

  const deleteExpense = async (id) => {
    await API.delete(`/expenses/${id}`);
  };

  const fetchIncome = async () => {
    try {
      const res = await API.get("/income");
      setIncome(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const addIncome = async (data) => {
    const res = await API.post("/income/add", data);
    return res.data;
  };

  return (
    <ExpenseContext.Provider value={{ expenses, income, fetchExpenses, addExpense, deleteExpense, fetchIncome, addIncome }}>
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpense = () => useContext(ExpenseContext);
