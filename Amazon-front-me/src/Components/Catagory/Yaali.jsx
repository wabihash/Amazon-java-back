import React, { useReducer, useEffect } from 'react'
import axios from "axios"
const initialState = {
    loading: false,
    data: null,
    error: null
};
function reducer(state, action) {
    switch (action.type) {
        case "Start":
            return { loading: true, data: null, error: null };
    
        case "Error":
            return { loading: false, data: null, error: action.payload }
    
        case "Success":
            return { loading: false, data: action.payload, error: null }
        default:
            return state;
    }


}

function ApiWithReducer() {
    const [state, dispatch] = useReducer(reducer, initialState);
    useEffect(() => {
        dispatch({ type: "Start" });
        axios
            .get("https://jsonplaceholder.typicode.com/posts/1")
            .then((res) => {
                dispatch({ type: "Success", payload: res.data });

            })
            .catch((err) => {
                dispatch({ type: "Error", payload: err.message })
            })
    }, []);

    if (state.loading) return <h2>Loading.....</h2>
    if (state.error) return <h2>Error : {state.error}</h2>
    
    return (
        <div>
            <h2>{state.data?.title}</h2>
           <p>{state.data?.body}</p>

        </div>
    )
}
export default  ApiWithReducer