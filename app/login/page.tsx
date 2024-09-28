// app/login/page.tsx
import { FC } from 'react';

const LoginPage: FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Log In</h2>
        <form>
          <input
            type="text"
            placeholder="Email"
            className="w-full p-3 mb-4 border border-gray-300 rounded"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 mb-6 border border-gray-300 rounded"
          />
          <button className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600">
            Log In
          </button>
          <p className="text-center mt-4">
            or <a href="#" className="text-blue-500">Sign up</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;