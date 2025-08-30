import ChatWindow from '@/components/ChatWindow';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Awaken Chatbot
          </h1>
          <p className="text-lg text-gray-600">
            A modern AI chatbot that can be embedded in any website
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Features
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-gray-700">
                ✨ Modern UI
              </h3>
              <p className="text-gray-600">
                Beautiful, responsive design with smooth animations and modern
                styling
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-gray-700">
                🚀 Easy Integration
              </h3>
              <p className="text-gray-600">
                Simple iframe embedding for any website with proper CORS
                configuration
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-gray-700">
                💬 Real-time Chat
              </h3>
              <p className="text-gray-600">
                Instant messaging with typing indicators and message timestamps
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-gray-700">
                📱 Responsive
              </h3>
              <p className="text-gray-600">
                Works perfectly on desktop, tablet, and mobile devices
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            How to Embed
          </h2>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
            <pre>{`<iframe 
  src="https://your-deployed-app.vercel.app" 
  width="400" 
  height="600" 
  frameborder="0"
  style="border: none; border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);"
></iframe>`}</pre>
          </div>
        </div>
      </div>

      <ChatWindow />
    </main>
  );
}
