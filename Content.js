
import { StyleSheet, Text, View, ImageBackground,TouchableOpacity, Platform, Button, Alert, TextInput} from 'react-native';
import {useState,useEffect,useContext} from 'react';
import Loader from './Loader';
import axios from 'axios';
import {IndexContext} from './SpeakContext'
import * as Speech from 'expo-speech'; 
import * as DocumentPicker from 'expo-document-picker';
const backImg = require('./assets/back.gif');
export default function Content(){
    
    
   


    const [PDF,setPDF] = useState(null); //the selected pdf file
    const [TEXT,setText] = useState(null); //contains the whole text of the page 
    const [Playing,setPlaying] = useState(false); 
    const [IsDone,setIsDone] = useState(false); // to check whether speaker is done or not 
    const [Allow,setAllow] = useState(true); // allowing to select files
    const [Index,setIndex] = useState(0); // index of the word of the TEXT
    const [Onstart,setOnstart] = useState(false); //to check whether speaker just start or not 
    const [Page,setPage] = useState(1); // which page of the pdf files
    const [res,setres] = useState(null); // which paragraph the speaker is speaking   
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

  if(Playing && TEXT){ // if in playing state and words are still left
 
   if(!IsDone){  // if the paragraph is not completed yet then check whether the user pressed
                 // pause button or not
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
        // selecting every 20 words and showing it on screen...
        // expo-speech module doesn't support resume functionalities :(
      setres(text);
      

     if(text.length === 0){ //Handling actions after text in the page is finished
    
    
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


     //if text is not finished keep speaking 
    Speech.speak(text,{rate:0.8,
        onDone:() => {
            setOnstart(false)
            setIsDone(true)
        },
        onStart:()=>setOnstart(true)});
      
    }
  }
    

    if(IsDone) {// go for next 20 words
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
//https://pdf-audio.herokuapp.com/post
    setLoad(true);
        const url = `https://server-pdf-to-text.herokuapp.com/post/${Page}`;
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
         //console.log(PDF);
        formData.append(PDF);  
     
         
          
         xhr.addEventListener('load', ()=>{
             
              let arr = xhr.response.split(',');
           
               if(arr[0] === 'NOPAGES'){// if page number is more than the total pages
                   Alert.alert(
                        "Page Limit Exceeded",
                     "No more Pages Found",
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
                    setLoad(false);
               }
               else if(arr[0] === '[]') { // if the page contains some images or non-text elements
                console.log(arr);
                           Alert.alert(
                        "No text found in this Page",
                     "This page may contain some images or non-text element",
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
                setLoad(false);
            
               }
             else{  
              if(arr[0] === 'Server-got-no-PDF'){ // maybe some connection issues

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

 // try{
   
 //   console.log(formData);
 //    await axios.post(url,formData,headers);
 //   setLoad(false);
 //   console.log(2);

 // }
 // catch(err){
 //    console.log(err);
 // }

xhr.onerror = function (e) {
  setLoad(false);
  setError(true);
};
        
        xhr.open('POST',url,true);
        xhr.setRequestHeader('Content-Type','multipart/form-data');
        xhr.send(formData);
      
};


const prev = () => { //next page
  
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

const next = () => { // previous page

  
    
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

           { !Onstart && !res ? // when no pdf is choosen
              <TouchableOpacity  style = {styles.input} onPress = {handleFile}> 
                   <Text style = {styles.text}> { PDF ? PDF.name.slice(0,11) + "...." : "Select Pdf" }</Text>
              </TouchableOpacity> : <View/>
          }
            {
                PDF && !TEXT  && !res ? // after selecting pdf, getting text from the server             
               <TouchableOpacity style = {styles.getaudio} onPress = {getAudio}>
                    <Text style = {styles.audiotext}> Get Audio </Text>
               </TouchableOpacity> :  <View/>
          }
        
            
            { Onstart ? // showing the speaking part
                <View style = {styles.res}>
                <Text style = {styles.audioText}> { res + '........'} </Text> 
                </View>
                : <View/>}   
            

            {
                TEXT ? // After Text got fetched handling the button functionalities (pause,play etc)
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
