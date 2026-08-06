import axios from "axios";

const API = axios.create({ baseURL: "https://finance-flow-expense-tracker.onrender.com" });

export default API;
