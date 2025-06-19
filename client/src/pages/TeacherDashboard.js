import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { setCurrentPoll, endPoll } from '../store/pollSlice';
import { addMessage, toggleChat } from '../store/chatSlice';
import { ChatBubbleLeftIcon, XMarkIcon, UserGroupIcon, StarIcon } from '@heroicons/react/24/outline';

const socket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:5000');

const TeacherDashboard = () => {
  const dispatch = useDispatch();
  const { currentPoll } = useSelector((state) => state.poll);
  const { isChatOpen, messages } = useSelector((state) => state.chat);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [timeLimit, setTimeLimit] = useState(60);
  const [correctOptions, setCorrectOptions] = useState([false, false]);
  const [questionCharCount, setQuestionCharCount] = useState(0);
  const [connectedStudents, setConnectedStudents] = useState([]);
  const [chatMessage, setChatMessage] = useState('');
  const [results, setResults] = useState(null);
  const [pollHistory, setPollHistory] = useState([]);
  const [isPollActive, setIsPollActive] = useState(false);
  const timeOptions = [30, 45, 60, 90, 120];

  useEffect(() => {
    socket.emit('teacher:join');

    socket.on('poll:new', (poll) => {
      dispatch(setCurrentPoll(poll));
      setIsPollActive(true);
      setResults(null);
    });

    socket.on('poll:results', (pollResult) => {
      setResults(pollResult);
      setIsPollActive(false);
      dispatch(endPoll());
      setPollHistory((prev) => [pollResult, ...prev]);
    });

    socket.on('students:list', (students) => {
      setConnectedStudents(students);
    });

    socket.on('student:joined', (student) => {
      setConnectedStudents((prev) => [...prev, student]);
    });

    socket.on('student:left', (student) => {
      setConnectedStudents((prev) => prev.filter((s) => s.id !== student.id));
    });

    socket.on('poll:history', (history) => {
      setPollHistory(history.reverse());
    });

    socket.on('chat:message', (message) => {
      dispatch(addMessage(message));
    });

    return () => {
      socket.off('poll:new');
      socket.off('poll:results');
      socket.off('students:list');
      socket.off('student:joined');
      socket.off('student:left');
      socket.off('poll:history');
      socket.off('chat:message');
    };
  }, [dispatch]);

  useEffect(() => {
    socket.emit('poll:history');
  }, []);

  const handleCreatePoll = (e) => {
    e.preventDefault();
    if (!question.trim() || options.some(opt => !opt.trim()) || isPollActive) return;
    const pollData = {
      question,
      options: options.map((opt, i) => ({ text: opt, isCorrect: correctOptions[i] })),
      timeLimit,
    };
    socket.emit('poll:create', pollData);
    setQuestion('');
    setOptions(['', '']);
    setCorrectOptions([false, false]);
    setQuestionCharCount(0);
  };

  const handleAddOption = () => {
    setOptions([...options, '']);
    setCorrectOptions([...correctOptions, false]);
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleOptionCorrectChange = (index, value) => {
    const newCorrect = [...correctOptions];
    newCorrect[index] = value;
    setCorrectOptions(newCorrect);
  };

  const handleQuestionChange = (e) => {
    setQuestion(e.target.value);
    setQuestionCharCount(e.target.value.length);
  };

  const handleEndPoll = () => {
    socket.emit('poll:end');
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    socket.emit('chat:message', chatMessage);
    setChatMessage('');
  };

  const handleKickStudent = (studentId) => {
    socket.emit('student:kick', studentId);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="max-w-3xl mx-auto w-full px-6 pt-12 pb-32">
        {/* Badge */}
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-sm font-medium mb-6">
          <StarIcon className="h-4 w-4 mr-2" />
          Intervue Poll
        </div>
        {/* Heading */}
        <h1 className="text-4xl font-bold mb-2">Let's <span className="text-black font-extrabold">Get Started</span></h1>
        <p className="text-gray-500 mb-10 max-w-xl">you'll have the ability to create and manage polls, ask questions, and monitor your students' responses in real-time.</p>
        {/* Poll Form */}
        <form className="space-y-8" onSubmit={handleCreatePoll}>
          {/* Question */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-lg font-semibold">Enter your question</label>
              <div className="relative">
                <select
                  value={timeLimit}
                  onChange={e => setTimeLimit(Number(e.target.value))}
                  className="px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-400"
                  disabled={isPollActive}
                >
                  {timeOptions.map(opt => (
                    <option key={opt} value={opt}>{opt} seconds</option>
                  ))}
                </select>
                <span className="absolute right-3 top-3 pointer-events-none text-violet-500">▼</span>
              </div>
            </div>
            <div className="relative">
              <textarea
                value={question}
                onChange={handleQuestionChange}
                maxLength={100}
                rows={3}
                className="w-full px-4 py-4 rounded-xl border border-gray-200 bg-gray-100 text-lg focus:ring-2 focus:ring-violet-400 focus:border-violet-400 resize-none"
                placeholder="Type your question here..."
                disabled={isPollActive}
              />
              <span className="absolute bottom-3 right-4 text-gray-400 text-xs">{questionCharCount}/100</span>
            </div>
          </div>
          {/* Options */}
          <div>
            <label className="text-lg font-semibold mb-4 block">Edit Options</label>
            <div className="space-y-4">
              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-4">
                  <span className="flex items-center justify-center h-8 w-8 rounded-full bg-violet-100 text-violet-700 font-bold">{index + 1}</span>
                  <input
                    type="text"
                    value={option}
                    onChange={e => handleOptionChange(index, e.target.value)}
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 focus:ring-2 focus:ring-violet-400 focus:border-violet-400"
                    placeholder={`Option ${index + 1}`}
                    disabled={isPollActive}
                  />
                  <div className="flex items-center gap-2 ml-4">
                    <span className="font-medium text-gray-700">Is it Correct?</span>
                    <label className="flex items-center ml-2">
                      <input
                        type="radio"
                        name={`correct-${index}`}
                        checked={!!correctOptions[index]}
                        onChange={() => handleOptionCorrectChange(index, true)}
                        className="accent-violet-500"
                        disabled={isPollActive}
                      />
                      <span className="ml-1 text-violet-700">Yes</span>
                    </label>
                    <label className="flex items-center ml-2">
                      <input
                        type="radio"
                        name={`correct-${index}`}
                        checked={!correctOptions[index]}
                        onChange={() => handleOptionCorrectChange(index, false)}
                        className="accent-violet-500"
                        disabled={isPollActive}
                      />
                      <span className="ml-1 text-violet-700">No</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={handleAddOption}
              className="mt-6 px-4 py-2 border border-violet-400 text-violet-700 rounded-lg hover:bg-violet-50 font-medium"
              disabled={isPollActive}
            >
              + Add More option
            </button>
          </div>
        </form>
        {/* Ask Question Button */}
        <div className="fixed bottom-0 left-0 w-full flex justify-end bg-white border-t border-gray-200 py-6 px-8 z-10">
          <button
            type="submit"
            form="poll-form"
            onClick={handleCreatePoll}
            className="bg-gradient-to-r from-violet-500 to-indigo-500 text-white text-lg font-semibold px-12 py-3 rounded-full shadow-lg hover:from-violet-600 hover:to-indigo-600 transition"
            disabled={isPollActive}
          >
            Ask Question
          </button>
        </div>
        {/* Live Results */}
        {isPollActive && currentPoll && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-4">Live Results</h2>
            <div className="space-y-4">
              {currentPoll.options.map((option, idx) => {
                const votes = results?.options?.[idx]?.votes || 0;
                const total = results?.totalStudents || connectedStudents.length || 1;
                return (
                  <div key={idx} className="flex items-center">
                    <span className="flex items-center justify-center h-8 w-8 rounded-full bg-violet-100 text-violet-700 font-bold mr-4">{idx + 1}</span>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-900">{option.text}</span>
                        <span className="font-semibold text-violet-700">{votes ? Math.round((votes / total) * 100) : 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
                        <div className="bg-violet-500 h-3 rounded-full" style={{ width: `${votes ? (votes / total) * 100 : 0}%` }}></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <button
              onClick={handleEndPoll}
              className="mt-8 w-full bg-red-600 text-white py-3 px-4 rounded-xl hover:bg-red-700 transition duration-200 text-lg font-semibold"
            >
              End Poll
            </button>
          </div>
        )}
        {/* Connected Students & Kick */}
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-4">Participants</h2>
          <div className="bg-gray-50 rounded-xl p-4">
            <ul>
              {connectedStudents.map((student) => (
                <li key={student.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                  <span>{student.name}</span>
                  <button
                    onClick={() => handleKickStudent(student.id)}
                    className="text-red-500 hover:underline text-sm"
                  >
                    Kick out
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        {/* Poll History */}
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-4">Poll History</h2>
          {pollHistory.length === 0 ? (
            <div className="text-gray-500">No past polls yet.</div>
          ) : (
            pollHistory.map((poll, idx) => (
              <div key={idx} className="mb-8">
                <h3 className="font-semibold mb-2">Question {pollHistory.length - idx}</h3>
                <div className="bg-gray-100 rounded-xl p-4">
                  <div className="font-bold mb-2">{poll.question}</div>
                  {poll.options.map((option, oidx) => (
                    <div key={oidx} className="flex items-center mb-2">
                      <span className="flex items-center justify-center h-7 w-7 rounded-full bg-violet-100 text-violet-700 font-bold mr-3">{oidx + 1}</span>
                      <span className="flex-1">{option.text}</span>
                      <span className="ml-4 text-violet-700 font-semibold">{option.votes ? Math.round((option.votes / (poll.totalStudents || 1)) * 100) : 0}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
        {/* Chat Popup */}
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

export default TeacherDashboard; 