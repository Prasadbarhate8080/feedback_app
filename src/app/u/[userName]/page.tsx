"use client"
import { apiResponse } from '@/types/apiResponse';
import axios, { AxiosError } from 'axios';
import { useParams } from 'next/navigation'
import React, { useState } from 'react'
import { toast } from 'react-toastify';

function page() {
    const params = useParams<{userName: string}>();
    const [message, setMessage] = useState("")

    async function sendMessage() {
        try {
            const response = await axios.post<apiResponse>('/api/send-message',{
                username: params.userName,
                content:message
            });
            console.log(response)
            toast(
                <div>
                <div style={{fontSize:'14px'}}>{response.data.message}</div>
                </div>
            ,{})

        } catch (error) {
            const axiosError = error as AxiosError<apiResponse>;
            console.log(axiosError)
            toast.error(axiosError.response?.data.message)
        }
    }
  return (
    <div className='max-w-4xl  mx-auto mt-6 p-4'>
      <h1 className='text-4xl text-center font-bold mb-8'>Publik Profile Link</h1>
      <div>
        <label>Send Anonymous Messages to @{params.userName}</label>
        <div>
            <textarea className="flex mt-2 min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm 
            ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 
            focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
             placeholder="Write your anonymous message here" name="content" id=":R1auuuda:-form-item" 
             aria-describedby=":R1auuuda:-form-item-description" aria-invalid="false"
             value={message}
             onChange={(e) => {setMessage(e.currentTarget.value)}}
             ></textarea>
        </div>
      </div>
      <div className='p-2 mt-4 text-center'>
        <button className={`${message ? "bg-black" : "bg-gray-600"} text-white px-3 py-2 font-semibold  rounded-md`}
        onClick={() => {
            if(message.length < 6)
            {
                toast.error("message length is less than 6")
                return
            }
            sendMessage()}}
        >Send It</button>
      </div>
      <p className='mt-8'>Click on any message below to select it.</p>
      <div className='mt-4 border p-6 rounded-md'>
        <strong className='text-2xl font-semibold'>Messages</strong>
        <div className='flex flex-col gap-4 mt-4'>
            <div className='p-3 border rounded-md text-center hover:bg-gray-50 cursor-pointer'
            onClick={(e) => {
                setMessage(e.currentTarget.innerText)
            }}
            >Whats a hobby you've recently started?</div>
            <div className='p-3 border rounded-md text-center hover:bg-gray-50 cursor-pointer'
            onClick={(e) => {
                setMessage(e.currentTarget.innerText)
            }}
            >If you could have dinner with any historical figure, who would it be? </div>
            <div className='p-3 border rounded-md text-center hover:bg-gray-50 cursor-pointer'
            onClick={(e) => {
                setMessage(e.currentTarget.innerText)
            }}
            >Whats a simple thing that makes you happy?</div>
        </div>
      </div>
      <h3 className='mt-6  text-center font-semibold'>Get Your Message Board</h3>
      <div className='text-center mt-6 mb-10'>
        <button className='bg-gray-800 text-white px-3 py-2 font-semibold text-  rounded-md'>Create Your Account</button>
      </div>
    </div>
  )
}

export default page
