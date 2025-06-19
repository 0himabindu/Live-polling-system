import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { setCurrentPoll } from '../store/pollSlice';
import { addMessage, toggleChat } from '../store/chatSlice';
import { ChatBubbleLeftIcon, XMarkIcon, UserIcon } from '@heroicons/react/24/outline';

const socket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:5000');

const StudentDashboard = () => {
  const dispatch = useDispatch();
  const { currentPoll } = useSelector((state) => state.poll);
  const { isChatOpen, messages } = useSelector((state) => state.chat);
  const [selectedOption, setSelectedOption] = useState(null);
  const [studentName, setStudentName] = useState(() => sessionStorage.getItem('studentName') || '');
  const [isNameSubmitted, setIsNameSubmitted] = useState(!!sessionStorage.getItem('studentName'));
  const [chatMessage, setChatMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);
  const [kicked, setKicked] = useState(false);

  useEffect(() => {
    if (!isNameSubmitted) return;
    socket.emit('student:join', { name: studentName });

    socket.on('poll:new', (poll) => {
      console.log('[FRONTEND] poll:new received:', poll);
      dispatch(setCurrentPoll(poll));
      setSelectedOption(null);
      setTimeLeft(poll.timeLimit);
      setHasAnswered(false);
      setShowResults(false);
      setResults(null);
    });

    socket.on('poll:results', (pollResult) => {
      setResults(pollResult);
      setShowResults(true);
      setTimeLeft(null);
    });

    socket.on('kicked', () => {
      setKicked(true);
      setIsNameSubmitted(false);
      sessionStorage.removeItem('studentName');
    });

    socket.on('chat:message', (message) => {
      dispatch(addMessage(message));
    });

    return () => {
      socket.off('poll:new');
      socket.off('poll:results');
      socket.off('kicked');
      socket.off('chat:message');
    };
  }, [dispatch, isNameSubmitted, studentName]);

  useEffect(() => {
    if (!timeLeft || hasAnswered || showResults) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setShowResults(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, hasAnswered, showResults]);

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (!studentName.trim()) return;
    sessionStorage.setItem('studentName', studentName.trim());
    setIsNameSubmitted(true);
    socket.emit('student:join', { name: studentName.trim() });
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || hasAnswered) return;
    socket.emit('poll:answer', { optionIndex: selectedOption });
    setHasAnswered(true);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    socket.emit('chat:message', chatMessage);
    setChatMessage('');
  };

  if (kicked) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="mt-12 mb-6 flex justify-center">
          <span className="inline-flex items-center px-4 py-1 rounded-full bg-violet-600 text-white text-sm font-semibold">Intervue Poll</span>
        </div>
        <h1 className="text-3xl font-bold mb-4">You've been Kicked out !</h1>
        <p className="text-gray-500 mb-8">Looks like the teacher had removed you from the poll system. Please try again sometime.</p>
      </div>
    );
  }

  if (!isNameSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-8">
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Join the Session</h1>
            <form onSubmit={handleNameSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                <div className="relative">
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter your name"
                  />
                  <UserIcon className="h-5 w-5 text-gray-400 absolute right-3 top-3.5" />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-xl hover:bg-indigo-700 transition duration-200"
              >
                Join Session
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
            <p className="text-gray-600">Participate in live polls</p>
          </div>
          <button
            onClick={() => dispatch(toggleChat())}
            className="p-2 rounded-full hover:bg-gray-200 text-gray-600"
          >
            <ChatBubbleLeftIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          {!currentPoll && !showResults ? (
            <div className="text-center text-gray-500 py-12">
              <span className="inline-flex items-center px-4 py-1 rounded-full bg-violet-100 text-violet-700 text-sm font-semibold mb-4">Intervue Poll</span>
              <div className="flex flex-col items-center">
                <svg className="animate-spin h-8 w-8 text-violet-500 mb-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                <div className="text-lg font-semibold">Wait for the teacher to ask questions..</div>
              </div>
            </div>
          ) : showResults && results ? (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900">{results.question}</h2>
              </div>
              <div className="space-y-4">
                {results.options.map((option, idx) => (
                  <div key={idx} className="flex items-center">
                    <span className="flex items-center justify-center h-8 w-8 rounded-full bg-violet-100 text-violet-700 font-bold mr-4">{idx + 1}</span>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-900">{option.text}</span>
                        <span className="font-semibold text-violet-700">{option.votes ? Math.round((option.votes / (results.totalStudents || 1)) * 100) : 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
                        <div className="bg-violet-500 h-3 rounded-full" style={{ width: `${option.votes ? (option.votes / (results.totalStudents || 1)) * 100 : 0}%` }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-8 text-lg font-semibold text-gray-700">Wait for the teacher to ask a new question..</div>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">{currentPoll.question}</h2>
                {timeLeft !== null && (
                  <div className="text-sm font-medium text-gray-600 flex items-center">
                    <svg className="h-5 w-5 mr-1 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" /></svg>
                    <span className="text-red-500 font-bold">{timeLeft < 10 ? `00:0${timeLeft}` : `00:${timeLeft}`}</span>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                {currentPoll.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedOption(index)}
                    disabled={hasAnswered}
                    className={`w-full p-4 rounded-xl border-2 transition duration-200 flex items-center gap-4 ${
                      selectedOption === index
                        ? 'border-violet-600 bg-violet-50 text-violet-700'
                        : 'border-gray-200 hover:border-violet-200 text-gray-700'
                    }`}
                  >
                    <span className="flex items-center justify-center h-8 w-8 rounded-full bg-violet-100 text-violet-700 font-bold mr-2">{index + 1}</span>
                    <span className="font-medium text-lg">{option.text}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={handleSubmitAnswer}
                disabled={selectedOption === null || hasAnswered}
                className="mt-6 w-full bg-gradient-to-r from-violet-500 to-indigo-500 text-white py-3 px-4 rounded-full shadow-lg hover:from-violet-600 hover:to-indigo-600 transition disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
              >
                Submit
              </button>
            </div>
          )}
        </div>

        {isChatOpen && (
          <div className="fixed bottom-4 right-4 w-96 bg-white rounded-2xl shadow-lg">
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-900">Chat</h3>
                <button onClick={() => dispatch(toggleChat())} className="text-gray-500 hover:text-gray-700">
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="h-96 overflow-y-auto p-4">
              {messages.map((msg, index) => (
                <div key={index} className="mb-4">
                  <div className="font-medium text-gray-900">{msg.sender}</div>
                  <div className="text-gray-700">{msg.text}</div>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendMessage} className="p-4 border-t">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Type a message..."
                />
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition duration-200"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard; 