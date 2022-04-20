import { StyleSheet, Text, View, ImageBackground,TouchableOpacity, Platform, Button, Alert} from 'react-native';
import {useState,useEffect,useContext} from 'react';
import axios from 'axios';
import {IndexContext} from './SpeakContext'
import * as Speech from 'expo-speech'; 
import * as DocumentPicker from 'expo-document-picker';
const backImg = require('./assets/back.gif');
export default function Content(){
    
    const [PDF,setPDF] = useState(null);
    const [TEXT,setText] = useState(null);
    const [Playing,setPlaying] = useState(false);
    const [IsDone,setIsDone] = useState(false);
    const [lower,setlower] = useState(0);
    const [upper,setupper] = useState(3000);                      
    const [Allow,setAllow] = useState(true);
    const [AT,setAT] = useState(0);
    let INDEX = AT;
 
     useEffect(() => {
        if(IsDone){
       
       setlower(upper);
       setupper(upper + 3000);
       play();
       setIsDone(false);
  }
     },[IsDone])  
      
    
  
                      
        let INTERVAL = setInterval(()=>{
            
            if(Playing) {
             
               INDEX++;
            }
       
        },95)
 

      
  


  
    const handleFile = async () => {
      if(!Allow) 
        {

          Alert.alert(
             "one file is already selected",
             "press cancel to remove it",
          [{
               text:'got it',

         }]);
         
        return;
      }  
     try{

       let result = await DocumentPicker.getDocumentAsync({ type: "application/pdf" });
       console.log(result.type);
       if(result.type === 'success'){
         setPDF(result);
      }
     }
     catch(err) {
      console.error(err)
    }
  }


  const getAudio = async () => {
        const url = 'https://salty-lake-75892.herokuapp.com/post';
        const formData = new FormData();
        const xhr = new XMLHttpRequest();
        const headers = {
         'Content-Type': 'multipart/form-data'
       }
         formData.append('PDF',{
                    
                   uri: Platform.OS === 'android' ? PDF.uri : PDF.uri.replace('file://', ''),
                   type:'application/pdf',
                   name:PDF.name || PDF.fileName
            
            })
  
         xhr.addEventListener('load', ()=>{
             let text = xhr._response.replace(/\n/g, "");
            
          
             setText(text);
             console.log(text)
             setAllow(false);

         })
     
        xhr.open('POST',url,true);
        xhr.setRequestHeader('Content-Type','multipart/form-data');
        xhr.send(formData);
      
};

 
  const play = () => {
      
        
       Speech.speak(TEXT.substring(INDEX,upper),{
           rate:1,
           onStart:() => setPlaying(true),
           onStopped:() => setPlaying(false),
           onDone:() => setIsDone(true)
           
        });
      
  }

  const back = () => {  // backward
     stop();
    setAT(Math.max(AT - 300,lower));
    play(); 
  }

  const skip = () => { // forward
    stop();
    setAT(Math.min(AT + 300,upper));
    play();
  }

  const cancel = () => { 
    setPDF(null);
    setAllow(true);
    setText(null);
    setlower(0);
    setupper(3000);
    clearInterval(INTERVAL);
    setAT(0);
    Speech.stop();
    setPlaying(false);
  }
  const stop = () => {
    
     clearInterval(INTERVAL);
     setAT(INDEX);
     setAT(AT + Math.abs(AT - INDEX));
     console.log(AT,INDEX);
     Speech.stop();
     setPlaying(false);
     
  }

  return(
      <View style = {styles.content}> 
          <ImageBackground source = {backImg} style = {styles.image}>
              <TouchableOpacity  style = {styles.input} onPress = {handleFile}> 
                   <Text style = {styles.text}> { PDF ? PDF.name.slice(0,11) + "...." : "Select Pdf" }</Text>
              </TouchableOpacity>
            {
                PDF && !TEXT ?              
               <TouchableOpacity style = {styles.getaudio} onPress = {getAudio}>
                    <Text style = {styles.audiotext}> Get Audio </Text>
               </TouchableOpacity> :
                <View/>
            }
            {
                TEXT ?
            <View>
                 <View style = {styles.options}>
                  <TouchableOpacity style = {styles.option} onPress = {play}>
                    <Text style = {styles.option_text}> play </Text>
               </TouchableOpacity> 
                 <TouchableOpacity style = {styles.option} onPress = {stop}>
                    <Text style = {styles.option_text}> pause </Text>
               </TouchableOpacity> 
                 <TouchableOpacity style = {styles.option}  onPress = {cancel}>
                    <Text style = {styles.option_text}> cancel </Text>
               </TouchableOpacity>                   
                 </View>
                 
                 <View style = {styles.rewind}>
                    
                     <TouchableOpacity style = {styles.forward} onPress = {back}> 
                         <Text style = {styles.option_text}>  back </Text>
                     </TouchableOpacity>
                     
                     <TouchableOpacity style = {styles.backward} onPress = {skip}> 
                        <Text style = {styles.option_text}> skip </Text>
                     </TouchableOpacity>
                 </View>
         
          </View> 
                 :
                 <View/> 
            }
          </ImageBackground>
       </View>

	)
}

const styles = StyleSheet.create({
  content: {
    height:'100%',
    width:'100%',
    flex : 1,
   
},
options:{
  display:'flex',
  flexDirection:'row',
  marginTop:10,
  width:250,
  justifyContent:'space-around'
},
option_text:{
  color:'crimson',
  fontWeight:'bold'
},
rewind:{

  display:'flex',
  flexDirection:'row',
  marginTop:10,
  width:160,
  justifyContent:'space-around',
  alignItems:'center',
  marginLeft:'auto',
  marginRight:'auto'

},
backward:{
   fontSize:40,
   fontWeight:'bold',
    width:60,
  height:35,
  backgroundColor:'black',
     display:'flex',
     justifyContent:'center',
    alignItems:'center',
    borderRadius:10
},
forward:{
    width:60,
  height:35,
  backgroundColor:'black',
     display:'flex',
     justifyContent:'center',
    alignItems:'center',
    borderRadius:10
},
option:{
  width:70,
  height:40,
  backgroundColor:'black',
     display:'flex',
     justifyContent:'center',
    alignItems:'center',
    borderRadius:10
},
  image:{
    position:'absolute',
    zIndex:-1,
    height:"100%",
    width:"100%",
    flex:1,
    justifyContent:'center',
    alignItems:'center'
  },
  
  input:{
    height:150,
    width:150,
    display:'flex',
    justifyContent:'center',
    alignItems:'center',
    borderWidth:7,
    borderColor:'black',
    borderRadius:15
  },
  text:{
    fontWeight:'bold',
    fontSize:20
  },
  getaudio:{
    width:220,
    height:60,
    marginTop:20,
    backgroundColor:'black',
    display:'flex',
    justifyContent:'center',
    alignItems:'center',
    borderRadius:27
  },
   audiotext:{
    
    color:'crimson',
    fontWeight:'bold',
    fontSize:23
   }
});
