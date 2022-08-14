import React, { useState,useMemo,useRef } from 'react';
import {motion,AnimatePresence} from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const backdrop={
  visible:{opacity:1},
  hidden:{opacity:0}
}

const modal={
  hidden:{
    opacity:0
  },
  visible:{
    opacity:1,
    transition:{delay:0}
  }
}


const Modal=(
  {isModalOpen,setIsModalOpen,unavailableTimeSlots, updateUnavailableTimeSlotsInDb,date}
  )=>{

  console.log('modal');
  
  //show form only if available timeSlot is clicked
  const [isFormOpen,setIsFormOpen]=useState(false);
  const [selectedTimeSlot,setSelectedTimeSlot]=useState(false);
  
  //create refs for all the timeSlots divs to later access if innerText is Unavailable and Available 
  const refs = useMemo(() => Array.apply(null, Array(23)).map(Number.prototype.valueOf,0).map(() => React.createRef(null)), []);
  const inputRef = useRef(null);

  const onClickHandler=()=>{
    setIsModalOpen(false);
    setIsFormOpen(false);
  }

  const onClickTimeSlotHandler=(index,e)=>{
    if(refs[index]?.current?.innerText==='Unavailable'){
      setIsFormOpen(false);
      toast.error('Slot unavailable', {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        });
    }

    else{
      setIsFormOpen(true);
      setSelectedTimeSlot(index+1);
    }
    
  }

  const onFormSubmitHandler=(e)=>{
    e.preventDefault();
    if(!inputRef.current.value)
    {return;}

      toast.success(`Booked for ${inputRef.current.value} on ${date} at time ${selectedTimeSlot}:00`, {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        })
  
    updateUnavailableTimeSlotsInDb(inputRef.current.value, date,`${date} ${selectedTimeSlot}:00`);

    inputRef.current.value='';

    setIsModalOpen(false);
  }
  

  //create the timeSlots jsx for the selected date. 
  const timeArr=(unavailableTimeSlots)=>{
    //console.log(unavailableTimeSlots);
    return Array.apply(null, Array(23)).map(Number.prototype.valueOf,0).map((el,index)=>{
      //console.log(unavailableTimeSlots,index,unavailableTimeSlots?.includes(index))
      if(unavailableTimeSlots?.includes(index+1))
        return <div key={index} className='px-4 py-4 border-2 bg-red-500 hover:bg-red-400 cursor-pointer font-semibold' onClick={onClickTimeSlotHandler.bind(null,index)}>
            <p className='text-center'>{index+1}-{index+2}</p>
            <p ref={refs[index]} className=''>Unavailable</p>
          </div>
      else 
        return <div key={index} className='px-4 py-4 border-2 bg-lime-600 hover:bg-lime-500 cursor-pointer font-semibold' onClick={onClickTimeSlotHandler.bind(null,index)}>
            <p className='text-center'>{index+1}-{index+2}</p>
            <p ref={refs[index]} className='text-center'>Available</p>
          </div>
    })
  }

  return (
    <>
      <AnimatePresence exitBeforeEnter>
        {isModalOpen && (
            <motion.div
            className='fixed top-0 left-0 w-full h-full bg-black/50 z-10 flex place-items-center' 
            variants={backdrop}
            initial="hidden"
            animate="visible"
            onClick={onClickHandler}>
                <motion.div
                variants={modal}
                className='w-2/5 my-10 mx-auto rounded-lg bg-white border-2 border-slate-600 text-white p-2'
                onClick={(e)=>e.stopPropagation()}
                >
                  <h3 className='text-black text-center font-semibold text-lg mb-4 mt-2'>Time slots for {date}</h3>
                  <div className='grid gap-1 grid-cols-5 grid-rows-5 text-zinc-900'>
                    {timeArr(unavailableTimeSlots)}
                  </div>
                  {isFormOpen && 
                    <form className='mt-4' onSubmit={onFormSubmitHandler}>
                      <input ref={inputRef} className='border-2 mr-4 rounded-md p-2 text-black' placeholder='Reason for call'/>
                      <button onClick={onFormSubmitHandler} className='text-black p-2 bg-zinc-300  hover:bg-zinc-200 rounded-md'>Confirm Call</button>
                    </form>}
                </motion.div>
            </motion.div> )
            }
      </AnimatePresence>
      <ToastContainer
        />
    </>
  )
}

export default Modal;