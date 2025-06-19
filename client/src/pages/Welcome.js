import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setTeacher, setStudent } from '../store/userSlice';
import { StarIcon } from '@heroicons/react/24/solid';

const Welcome = () => {
  const [role, setRole] = useState(null); // 'student' or 'teacher'
  const [studentName, setStudentName] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleContinue = () => {
    if (role === 'teacher') {
      dispatch(setTeacher());
      navigate('/teacher');
    } else if (role === 'student' && studentName.trim()) {
      dispatch(setStudent({ name: studentName.trim(), id: Date.now().toString() }));
      navigate('/student');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      {/* Badge */}
      <div className="mt-12 mb-6 flex justify-center">
        <span className="inline-flex items-center px-4 py-1 rounded-full bg-violet-600 text-white text-sm font-semibold">
          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.385-2.46a1 1 0 00-1.175 0l-3.385 2.46c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118l-3.385-2.46c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.967z" /></svg>
          Intervue Poll
        </span>
      </div>
      {/* Heading & Subheading */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-3">Welcome to the <span className="text-black font-extrabold">Live Polling System</span></h1>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto">Please select the role that best describes you to begin using the live polling system</p>
      </div>
      {/* Role Selection or Name Input */}
      {role !== 'student' ? (
        <>
          <div className="flex flex-col md:flex-row gap-6 mb-12 justify-center">
            <button
              className={`flex-1 min-w-[260px] border-2 rounded-xl p-6 text-left transition-all duration-200 ${role === 'student' ? 'border-violet-600 shadow-lg bg-violet-50' : 'border-gray-200 bg-white hover:border-violet-300'}`}
              onClick={() => setRole('student')}
            >
              <div className="text-xl font-bold mb-2">I'm a Student</div>
              <div className="text-gray-500">Lorem Ipsum is simply dummy text of the printing and typesetting industry</div>
            </button>
            <button
              className={`flex-1 min-w-[260px] border-2 rounded-xl p-6 text-left transition-all duration-200 ${role === 'teacher' ? 'border-violet-600 shadow-lg bg-violet-50' : 'border-gray-200 bg-white hover:border-violet-300'}`}
              onClick={() => setRole('teacher')}
            >
              <div className="text-xl font-bold mb-2">I'm a Teacher</div>
              <div className="text-gray-500">Submit answers and view live poll results in real-time.</div>
            </button>
          </div>
          <button
            className={`mt-2 w-60 mx-auto block py-3 rounded-full text-lg font-semibold text-white bg-gradient-to-r from-violet-500 to-indigo-500 shadow-lg transition ${role ? 'hover:from-violet-600 hover:to-indigo-600' : 'opacity-50 cursor-not-allowed'}`}
            disabled={!role}
            onClick={handleContinue}
          >
            Continue
          </button>
        </>
      ) : (
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Let's <span className="text-black font-extrabold">Get Started</span></h1>
            <p className="text-gray-500 max-w-xl mx-auto">If you're a student, you'll be able to <span className="font-semibold text-black">submit your answers</span>, participate in live polls, and see how your responses compare with your classmates</p>
          </div>
          <div className="mb-8">
            <label className="block text-lg font-semibold mb-2 text-left">Enter your Name</label>
            <input
              type="text"
              value={studentName}
              onChange={e => setStudentName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 focus:ring-2 focus:ring-violet-400 focus:border-violet-400 text-lg"
              placeholder="Your name"
              required
            />
          </div>
          <button
            className={`w-60 mx-auto block py-3 rounded-full text-lg font-semibold text-white bg-gradient-to-r from-violet-500 to-indigo-500 shadow-lg transition ${studentName.trim() ? 'hover:from-violet-600 hover:to-indigo-600' : 'opacity-50 cursor-not-allowed'}`}
            disabled={!studentName.trim()}
            onClick={handleContinue}
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
};

export default Welcome; 