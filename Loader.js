import React from 'react'
import { View, Text, StyleSheet, ImageBackground } from 'react-native'

const load = require('./assets/load.gif')
const Loader = () => {
	return (
		<View style = {styles.frame}>
			
	     <ImageBackground
           source={load}
           style={styles.lottie}
         />
			
		</View>
	)
}

const styles = StyleSheet.create({
   frame:{
    height:'100%',
    position:'absolute',
    zIndex:100,
    width:'100%',
    display:'flex',
    justifyContent:'center',
    alignItems:'center',
    backgroundColor:'white'
  },
   lottie: {
    width: 300,
    height: 300
  }
})



export default Loader