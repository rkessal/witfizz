import React, { useEffect, useState } from "react";
import "./App.css";
import Sidenav from "./components/SideNav";
import StateProvider from "./components/providers/StateProvider";
import Login from "./pages/Login";
import "./App.css";
import { useDispatch, useSelector } from "react-redux";
import { SET_USER } from "./reducers/mapReducer";
import { useAuth } from "./hooks/useAuth";

function App() {
  const userState = useSelector((state) => {
    return state.user;
  });

  return (
    <>
      {!userState.id ? (
        <Login></Login>
      ) : (
        <div className="app">
          <StateProvider>
            <Sidenav></Sidenav>
          </StateProvider>
        </div>
      )}
    </>
  );
}

export default App;
