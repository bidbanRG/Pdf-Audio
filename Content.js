
import { StyleSheet, Text, View, ImageBackground,TouchableOpacity, Platform, Button, Alert, TextInput} from 'react-native';
import {useState,useEffect,useContext} from 'react';
import Loader from './Loader';
import axios from 'axios';
import {IndexContext} from './SpeakContext'
import * as Speech from 'expo-speech'; 
import * as DocumentPicker from 'expo-document-picker';
const backImg = require('./assets/back.gif');
export default function Content(){
    
    
   const {PAGES,setPAGES} = useContext(IndexContext);


    const [PDF,setPDF] = useState(null);
    const [TEXT,setText] = useState(null);
    const [Playing,setPlaying] = useState(false);
    const [IsDone,setIsDone] = useState(false);
    const [Allow,setAllow] = useState(true);
    const [Index,setIndex] = useState(0);
    const [Onstart,setOnstart] = useState(false);
    const [Page,setPage] = useState(1);
    const [res,setres] = useState(null);    
    const [Pause,setPause] = useState(false);
    const [Load,setLoad] = useState(false);
   const [error,setError] = useState(false);  
  
 
      
 

  if(error){

          Alert.alert(
             "Something went wrong...",
            "check your internet connections....",
             
          [{
               text:'Ok',

         }]);
          setError(false);
  }
    
  useEffect(() => {
     
     setPage(1);

  },[PDF])

  useEffect(() => {

  if(Playing && TEXT){
 
   if(!IsDone){
    if(Pause && res){
      Speech.speak(res,{rate:0.9,
        onDone:() => {
            setOnstart(false)
            setIsDone(true)
        },
        onStart:()=>setOnstart(true)}); 
      setPause(false);
    }
else{
       
      
      let text = TEXT.slice(Index ,Index + 20).join(' ').replace(/"|u000|/gm,'');
      setres(text);
      

     if(text.length === 0){
    
    
     setIndex(0);
     setOnstart(false);
    
    
      setres(null);
      setPlaying(false);
      setPause(false);

         Alert.alert(
             "You have completed this page",
             "Congratulations",
          [{
               text:'Ok',

         }]);
    
        Speech.stop();
    
    
     return;

     }


     
    Speech.speak(text,{rate:0.9,
        onDone:() => {
            setOnstart(false)
            setIsDone(true)
        },
        onStart:()=>setOnstart(true)});
      
    }
  }
    

    if(IsDone) {
        setIndex(Index + 20);
        setIsDone(false);
      }
  
}
  },[Playing,IsDone,Index])
    
 
const play = () => {
    setPlaying(true);
} 
      

  const back = () => {  // backward
    if(!Playing) return;  
    if(Index - 20 < 0) return;
     Speech.stop();
     setPlaying(false);
     setIndex(Math.max(Index - 20,0));
     setPlaying(true);


 }

  const skip = () => { // forward
    if(!Playing) return;  
    Speech.stop();
    setPlaying(false);
    setIndex(Index + 20);
    setPlaying(true);
 }

 const cancel = () => { 
    Speech.stop();
    setPDF(null);
    setAllow(true);
    setText(null);
    
    setIndex(0);
    setOnstart(false);
    setPage(1)
    
    setres(null);
    setPlaying(false);
    setPause(false);
  }
  const pause = () => {
    if(!Playing) return;  
     Speech.stop();
     setPlaying(false);
     setPause(true);
     
  }


  
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

    setLoad(true);
        const url = `https://server-pdf-to-audio.herokuapp.com/post/${Page}`;
        const formData = new FormData();
        const xhr = new XMLHttpRequest();
        const headers = {
         'Content-Type': 'multipart/form-data'
       }
         formData.append('PDF',{
                    
                   uri: Platform.OS === 'android' ? PDF.uri : PDF.uri.replace('file://', ''),
                   type:'application/pdf',
                   name:PDF.name || PDF.fileName,
                   
            
            })

         xhr.addEventListener('load', ()=>{
             
              let arr = xhr.response.split(',');
           

               if(arr[0] === '[]') {
                console.log(arr);
                           Alert.alert(
                        "No more Page Found",
                     "You have completed the PDF",
                   [{
                       text:'Ok',

                   }]);

                Speech.stop();
                setPlaying(false);
                setText(null);
                setres(null);
                setOnstart(false);
                setIndex(0);
                setPause(false);
                setIsDone(false);
                setPage(Page - 1);
                setLoad(false);
            
               }
             else{  
              if(arr === 'Server got no PDF'){

                   Alert.alert(
                     "Something went wrong try again",
                     
                   [{
                   text:'Ok',

              }]);
                   
                   setText(null);
                    return;
              }
              
              setText(arr);
              
              setAllow(false);
             setLoad(false);
         }

 })



xhr.onerror = function (e) {
  setLoad(false);
  setError(true);
};
        
        xhr.open('POST',url,true);
        xhr.setRequestHeader('Content-Type','multipart/form-data');
        xhr.send(formData);
      
};


const prev = () => {
  
    if(Page - 1 > 0) {
    Speech.stop();
    setPlaying(false);
    setText(null);
    setres(null);
    setOnstart(false);
    setIndex(0);
    setPause(false);
    setIsDone(false);
    setPage(Page - 1);
   }
}

const next = () => {

  
    
    Speech.stop();
    setPlaying(false);
   setText(null);
    setres(null);
    setOnstart(false);
    setIndex(0);
    setPause(false);
    setIsDone(false);
    setPage(Page + 1);   
}


  return(
      <View style = {styles.content}> 
      {Load && <Loader/>}
          <ImageBackground source = {backImg} style = {styles.image}>

           { !Onstart && !res ? 
              <TouchableOpacity  style = {styles.input} onPress = {handleFile}> 
                   <Text style = {styles.text}> { PDF ? PDF.name.slice(0,11) + "...." : "Select Pdf" }</Text>
              </TouchableOpacity> : <View/>
          }
            {
                PDF && !TEXT  && !res ?              
               <TouchableOpacity style = {styles.getaudio} onPress = {getAudio}>
                    <Text style = {styles.audiotext}> Get Audio </Text>
               </TouchableOpacity> :  <View/>
          }
        
            
            { Onstart ? 
                <View style = {styles.res}>
                <Text style = {styles.audioText}> { res + '........'} </Text> 
                </View>
                : <View/>}   
            

            {
                TEXT ?
            <View>
                 <View style = {styles.options}>
                  <TouchableOpacity style = {styles.option} onPress = {play}>
                    <Text style = {styles.option_text}> play </Text>
               </TouchableOpacity> 
                 <TouchableOpacity style = {styles.option} onPress = {pause}>
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

            {  PDF ?

                <View style = {styles.PAGE} onPress = {back}> 
                          <Text style = {styles.optionText} onPress = {prev}>  {'<'}  </Text>
                         <Text style = {styles.optionText}>  Page { Page  } </Text>
                         <Text style = {styles.optionText} onPress = {next}>  {'>'}  </Text>
                  </View> : <View/>
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
optionText:{
   fontWeight:'bold',
  textAlign:'center',
  color:'white',
  fontWeight:'bold',
  fontSize:18,
  color:'crimson'
},
PAGE:{
   marginTop:10,
   marginLeft:'auto',
   marginRight:'auto',
   display:'flex',
   flexDirection:'row',
   justifyContent:"space-around",
   alignItems:"center",
   backgroundColor:'black',
   height:40,
   width:150,
   borderRadius:7
},
audioText:{
  fontWeight:'bold',
  textAlign:'center',
  color:'white',
  fontWeight:'bold',
  

},
options:{
  display:'flex',
  flexDirection:'row',
  marginTop:10,
  width:250,
  marginLeft:'auto',
  marginRight:'auto',
  justifyContent:'space-around',
  alignItems:'center'
},
option_text:{
  color:'crimson',
  fontWeight:'bold',
 
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
  res:{
    width:'95%'
},

audiotext:{
    
    color:'crimson',
    fontWeight:'bold',
    fontSize:23
   }
});
