import React from 'react';
import {useState} from 'react'
const IndexContext = React.createContext();


 const IndexProvider = ({children}) => {

  const [PAGES,setPAGES] = useState({});


return(
    <IndexContext.Provider value = {{PAGES,setPAGES}}>
       {children}
    </IndexContext.Provider>
  )

} 

export {IndexContext,IndexProvider}