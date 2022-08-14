import React,{useState} from 'react';
import Modal from './Modal';
import FullCalendar from '@fullcalendar/react' // must go before plugins
import dayGridPlugin from '@fullcalendar/daygrid' // a plugin!
import interactionPlugin from "@fullcalendar/interaction" // needed for dayClick
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useQuery } from 'react-query';
import { useDatabaseUpdateMutation,useDatabaseSnapshot} from "@react-query-firebase/database";
import { ref } from "firebase/database";
import { db } from '../firebase-config';
import { useEffect } from 'react';

const fetchTimeSlots=async ()=>{
  const res = await fetch("https://private-37dacc-cfcalendar.apiary-mock.com/mentors/1/agenda");
  return res.json();
}

const getDateFromDateTimeString=str=>str.split(' ')[0].replaceAll('-', '')

//create a timeSlots array for the selected date which contains all the unavailable timeSlots picked from the api and database 
const createUnavailableTimeSlotsArr=(data,selectedDateStr,timeSlotsArr=[])=>{

  for(let i=0;i<data.length;i++){
    let currentDateNum=+(getDateFromDateTimeString(data[i].date_time));
    let selectedDate=+(getDateFromDateTimeString(selectedDateStr));
    
    if(currentDateNum>selectedDate)
      break;

    if(data[i].date_time.split(' ')[0].normalize()===selectedDateStr.normalize())
      timeSlotsArr.push(+data[i].date_time.split(' ')[1].split(':')[0]);
  }

  return timeSlotsArr;
}

const showSuccessPopup=(reasonStr,selectedDate,selectedTimeSlot)=>{

  toast.success(`Booked for ${reasonStr} on ${selectedDate} at time ${selectedTimeSlot}:00`, {
    position: "top-center",
    autoClose: 2000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    })
}

const Home=()=>{

    const { isLoading, isError, data, error }=useQuery(["timeSlots"],fetchTimeSlots);
    
    const dbRef=ref(db,"unavailableTimeSlots");
    //gives database snapshot
    const unavailableTimeSlotsDbSnapshot = useDatabaseSnapshot(["unavailableTimeSlots"], dbRef);
    //to add data to database
    const unavailableTimeSlotsMutation = useDatabaseUpdateMutation(dbRef);

    const [isModalOpen,setIsModalOpen]=useState(false);
    const [dataFromDb,setDataFromDb]=useState([]);
    const [unavailableTimeSlots,setUnavailableTimeSlots]=useState([]);
    const [selectedDate,setSelectedDate]=useState('');

    //console.log(data,dataFromDb)

    useEffect(()=>{

      //get database data after a mutation and update state dataFromDb
      if(unavailableTimeSlotsMutation.isSuccess)
      
        setDataFromDb((prevState)=>{
          return [...prevState,{'date_time':Object.keys(unavailableTimeSlotsMutation.variables)[0]}]
        })

      //get database data only for the first time when app loads
      else if(unavailableTimeSlotsDbSnapshot.isSuccess && dataFromDb.length===0){
        const snapshot = unavailableTimeSlotsDbSnapshot.data;
        let children = [];

        // Iterate the values in order and add an element to the array
        snapshot?.forEach((childSnapshot) => {
            children.push(
              {'date_time':childSnapshot.key}
            );
          });

          setDataFromDb(children) 
      }

    },[unavailableTimeSlotsDbSnapshot.isSuccess,unavailableTimeSlotsMutation.isSuccess])

    const handleDateClick = (arg) => {
        let timeSlotsArr=[]

        //get all the unavailable timeSlots for the selected date from api
        timeSlotsArr=createUnavailableTimeSlotsArr(data.calendar,arg.dateStr);
        
        //get all the unavailable timeSlots for the selected date from api and database
        let timeSlotsArrsTotal=createUnavailableTimeSlotsArr(
          dataFromDb.sort((a,b) => (a.date_time > b.date_time) ? 1 : ((b.date_time > a.date_time) ? -1 : 0)),
          arg.dateStr,timeSlotsArr);

        setSelectedDate(arg.dateStr);
        setUnavailableTimeSlots(timeSlotsArrsTotal);
        setIsModalOpen(true);
      }

      const updateUnavailableTimeSlotsInDb=(reasonStr,selectedDate,selectedTimeSlot)=>{
        //console.log(unavailableTimeSlotsDbSnapshot?.data);

        //add selectedTimeSlot to database. timeSlot will no longer be available
        unavailableTimeSlotsMutation.mutate({
         [selectedTimeSlot]:true
        })

        //toast.success('alright');;
      
       // showSuccessPopup(reasonStr,selectedDate,selectedTimeSlot)
      }
    
    return(
      <div className='m-10'>
        <h1 className='text-center text-4xl font-bold'>Calendar Call Schedular</h1>
        <FullCalendar
        plugins={[ dayGridPlugin, interactionPlugin ]}
        dateClick={handleDateClick}
        initialView="dayGridMonth"/>
        {isModalOpen && <Modal updateUnavailableTimeSlotsInDb={updateUnavailableTimeSlotsInDb} date={selectedDate} unavailableTimeSlots={unavailableTimeSlots} isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen}/>}
        <ToastContainer
        />
      </div>
    )
       
}

export default Home;