import React from 'react';
import {useState} from 'react'
const IndexContext = React.createContext();


 const IndexProvider = ({children}) => {

  const [INDEX,setINDEX] = useState(0);


return(
    <IndexContext.Provider value = {{INDEX,setINDEX}}>
       {children}
    </IndexContext.Provider>
  )

} 

export {IndexContext,IndexProvider}