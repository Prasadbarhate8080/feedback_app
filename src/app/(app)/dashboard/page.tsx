'use client';

import { MessageCard } from '@/components/MessageCard';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
// import { useToast } from '@/components/ui/use-toast';
import { toast } from 'react-toastify';
import { Message } from '@/models/user.model';
import { apiResponse } from '@/types/apiResponse';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import { Divide, Loader2, RefreshCcw } from 'lucide-react';
import { User } from 'next-auth';
import { useSession } from 'next-auth/react';
import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { acceptMessageSchema } from '@/schemas/acceptMessageSchema';

function UserDashboard() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);


  const handleDeleteMessage = (messageId: string) => {
    setMessages(messages.filter((message) => message._id !== messageId));
  };

  const { data: session } = useSession();


  // useEffect(() => {console.log(session)},[session])

  
  const form = useForm({
    resolver: zodResolver(acceptMessageSchema),
  });

  const { register, watch, setValue } = form;
  const acceptMessages = watch('acceptMessages');

  const fetchAcceptMessages = useCallback(async () => {
    setIsSwitchLoading(true);
    try {
      const response = await axios.get<apiResponse>('/api/accept-messages');
      setValue('acceptMessages', response.data.isAcceptingMessages ?? false);
    } catch (error) {
      const axiosError = error as AxiosError<apiResponse>;
    
          toast(
          <div>
            <strong style={{ fontSize: '16px' }}> Error</strong>
            <div style={{ fontSize: '14px' }}>{axiosError.response?.data.message ?? 
            'Failed to fetch message settings'}</div>
          </div>,
          {
            type:'error',
            hideProgressBar: true,
            closeButton:false
          }
        )
    } finally {
      setIsSwitchLoading(false);
    }
  }, [setValue, toast]);

  const fetchMessages = useCallback(
    async (refresh: boolean = false) => {
      setIsLoading(true);
      setIsSwitchLoading(false);
      try {
        const response = await axios.get<apiResponse>('/api/get-messages');
        setMessages(response.data.messages || []);
        if (refresh) {
        
        toast(
          <div>
            <strong style={{fontSize:'16px'}}>Refreshed Message</strong>
            <div style={{fontSize:'14px'}}>Showing latest messages</div>
          </div>
        ,{})
        }
      } catch (error) {
        const axiosError = error as AxiosError<apiResponse>;
        console.log(axiosError)
        toast(
          <div>
            <strong style={{fontSize:'16px'}}></strong>
            <div style={{fontSize:'14px'}}>{axiosError.response?.data.message ?? 'Failed to fetch messages'}</div>
          </div>
        ,{
          
          closeButton:false,
          hideProgressBar:true
        })
      } finally {
        setIsLoading(false);
        setIsSwitchLoading(false);
      }
    },
    [setIsLoading, setMessages, toast]
  );

  // Fetch initial state from the server
  useEffect(() => {
    if (!session || !session.user) return;

    fetchMessages();

    fetchAcceptMessages();
  }, [session, setValue, toast, fetchAcceptMessages, fetchMessages]);

  // Handle switch change
  const handleSwitchChange = async () => {
    try {
      const response = await axios.post<apiResponse>('/api/accept-messages', {
        acceptMessages: !acceptMessages,
      });
      setValue('acceptMessages', !acceptMessages);
   
    toast(
      <div>
        <strong style={{fontSize:'16px'}}>{response.data.message}</strong>
      </div>
    ,{
      icon:false
    })
    } catch (error) {
      const axiosError = error as AxiosError<apiResponse>;
    
    toast(
          <div>
            <strong style={{fontSize:'16px'}}>Error</strong>
            <div style={{fontSize:'14px'}}>{axiosError.response?.data.message ?? 'Failed to update message settings'}</div>
          </div>
        ,{
          type:"error",
          closeButton:false,
          hideProgressBar:true,
          icon:false
        })
    }
  };

  if (!session || !session.user) {
    return <div></div>;
  }

  const { userName } = session.user as User;

  const baseUrl = `${window.location.protocol}//${window.location.host}`;
  const profileUrl = `${baseUrl}/u/${userName}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    
    toast(
          <div>
            <strong style={{fontSize:'16px'}}>URL Copied!</strong>
            <div style={{fontSize:'14px'}}>Profile URL has been copied to clipboard.</div>
          </div>,
          {
            icon:false,
            hideProgressBar:true,
            closeButton:false
          })
  };

  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>

      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>{' '}
        <div className="flex items-center">
          <input
            type="text"
            value={profileUrl}
            disabled
            className="input input-bordered w-full p-2 mr-2"
          />
          <Button onClick={copyToClipboard}>Copy</Button>
        </div>
      </div>

      <div className="mb-4">
        <Switch
          {...register('acceptMessages')}
          checked={acceptMessages}
          onCheckedChange={handleSwitchChange}
          disabled={isSwitchLoading}
        />
        <span className="ml-2">
          Accept Messages: {acceptMessages ? 'On' : 'Off'}
        </span>
      </div>
      <Separator />

      <Button
        className="mt-4"
        variant="outline"
        onClick={(e) => {
          e.preventDefault();
          fetchMessages(true);
        }}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCcw className="h-4 w-4" />
        )}
      </Button>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {messages.length > 0 ? (
          messages.map((message, index) => (
            <MessageCard
              key={message._id}
              message={message}
              onMessageDelete={handleDeleteMessage}
            />
          ))
        ) : (
          <p>No messages to display.</p>
        )}
      </div>
    </div>
  );
}

export default UserDashboard;