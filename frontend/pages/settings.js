export default function Settings() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-1">Configure system preferences and user settings</p>
          </div>
        </div>
      </div>

      {/* Coming Soon */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
        <div className="text-center">
          <div className="text-6xl mb-4">⚙️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Coming Soon</h2>
          <p className="text-gray-600 mb-6">The settings management system is under development.</p>
          <div className="bg-gray-50 rounded-lg p-4 text-left max-w-md mx-auto">
            <h3 className="font-semibold text-gray-900 mb-2">Planned Features:</h3>
            <ul className="text-sm text-gray-800 space-y-1">
              <li>• User account management</li>
              <li>• System configuration</li>
              <li>• Notification preferences</li>
              <li>• Security settings</li>
              <li>• Data export/import</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 