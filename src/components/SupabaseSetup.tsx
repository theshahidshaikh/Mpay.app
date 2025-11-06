import React from 'react';
import { AlertCircle, Database, ExternalLink } from 'lucide-react';

const SupabaseSetup: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Database className="h-16 w-16 text-primary-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Connect to Supabase
            </h1>
            <p className="text-gray-600">
              To use the mosque Collection Management App, you need to connect to Supabase
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-amber-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-amber-800 mb-1">
                  Supabase Connection Required
                </h3>
                <p className="text-sm text-amber-700">
                  This application requires a Supabase database to store user accounts, household information, and payment records.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Quick Setup Steps:
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Click the "Connect to Supabase" button in the top right corner</li>
                <li>Create a new Supabase project or use an existing one</li>
                <li>The database schema will be automatically created</li>
                <li>Start using the application with full functionality</li>
              </ol>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">What you'll get:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• User authentication and role management</li>
                <li>• Household registration and profile management</li>
                <li>• Payment tracking and history</li>
                <li>• Admin dashboards with reporting</li>
                <li>• Real-time data synchronization</li>
              </ul>
            </div>

            <div className="text-center">
              <a
                href="https://supabase.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
              >
                Learn more about Supabase
                <ExternalLink className="h-4 w-4 ml-1" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupabaseSetup;