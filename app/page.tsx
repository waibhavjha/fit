'use client';
import { useState } from 'react';

const FEATURES = [
  { symbol: 'InvoiceGen', name: 'Generate Professional Invoices' },
  { symbol: 'TrackPayments', name: 'Track Payment Status' },
  { symbol: 'AutoReminders', name: 'Automated Payment Reminders' },
  { symbol: 'Dashboard', name: 'Income & Overdue Summary' },
  { symbol: 'Integrations', name: 'Payment Platform Integrations' }
].sort((a, b) => a.name.localeCompare(b.name));

interface Feature {
  symbol: string;
  name: string;
}

export default function FreelancerInvoiceTracker() {
  const [selectedFeatures, setSelectedFeatures] = useState<Feature[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [, setIsLoading] = useState(false);
  const [report, setReport] = useState('');
  const [stage, setStage] = useState<'input' | 'loading' | 'report'>('input');

  const handleFeatureSelect = (feature: Feature) => {
    if (selectedFeatures.length >= 3) {
      setError('Maximum 3 features allowed');
      return;
    }
    if (selectedFeatures.some(f => f.symbol === feature.symbol)) {
      setError('Feature already selected');
      return;
    }
    setSelectedFeatures([...selectedFeatures, feature]);
    setError('');
  };

  const handleRemoveFeature = (symbol: string) => {
    setSelectedFeatures(selectedFeatures.filter(f => f.symbol !== symbol));
    setError('');
  };

  const handleGenerateReport = async () => {
    if (selectedFeatures.length === 0) {
      setError('Please select at least one feature');
      return;
    }

    setStage('loading');
    setIsLoading(true);

    try {
      const featuresList = selectedFeatures.map(f => `${f.name} (${f.symbol})`).join(', ');
      const prompt = `You are a SaaS strategist. Analyze the following features for a Freelancer Invoice Tracker: ${featuresList}.\n\nProvide a comprehensive report including:\n1. Benefits of these features with practical use cases.\n2. Actionable strategies for implementation and user engagement.\n3. Challenges freelancers face and how these features resolve them.\n4. Suggestions for scaling the tool effectively.`;

      const aiResponse = await fetch('https://gemini-api-worker.waibhav204.workers.dev/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(prompt)
      });

      if (!aiResponse.ok) {
        throw new Error('Failed to generate report');
      }

      const reportData = await aiResponse.json();
      setReport(reportData);
      setStage('report');
    } catch {
      setError('Failed to generate report. Please try again.');
      setStage('input');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="bg-gradient-to-r from-blue-50 to-indigo-100 min-h-screen flex items-center justify-center">
      <div className="w-full max-w-4xl mx-auto px-6 py-12 bg-white shadow-lg rounded-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Freelancer Invoice Tracker
          </h1>
          <p className="mt-4 text-lg text-gray-600 sm:text-xl">
            Select up to 3 features to enhance your freelancing workflow.
          </p>
        </div>

        <div className="space-y-8">
          {stage === 'input' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURES.map((feature) => (
                <button
                  key={feature.symbol}
                  onClick={() => handleFeatureSelect(feature)}
                  disabled={selectedFeatures.some(f => f.symbol === feature.symbol)}
                  className={`p-5 rounded-xl text-left transition-all duration-300 transform hover:scale-105 ${
                    selectedFeatures.some(f => f.symbol === feature.symbol)
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-white border-2 border-gray-300 hover:border-indigo-500 hover:shadow-xl'
                  }`}
                >
                  <div className="font-semibold text-gray-800">{feature.symbol}</div>
                  <div className="text-sm text-gray-500">{feature.name}</div>
                </button>
              ))}
            </div>
          )}

          {selectedFeatures.length > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl">
              <h2 className="font-semibold mb-4 text-gray-700">Selected Features:</h2>
              <div className="flex flex-wrap gap-3">
                {selectedFeatures.map((feature) => (
                  <div
                    key={feature.symbol}
                    className="group flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-md"
                  >
                    <span className="font-medium text-gray-800">{feature.symbol}</span>
                    <button
                      onClick={() => handleRemoveFeature(feature.symbol)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="text-red-600 text-center text-sm bg-red-100 p-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            onClick={handleGenerateReport}
            disabled={selectedFeatures.length === 0}
            className={`w-full p-4 rounded-xl font-medium text-lg transition-all duration-200 ${
              selectedFeatures.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl'
            }`}
          >
            Generate Insights
          </button>

          {stage === 'loading' && (
            <div className="flex flex-col items-center justify-center py-16 space-y-6">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
              <p className="text-gray-500">Generating insights...</p>
            </div>
          )}

          {stage === 'report' && (
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h2 className="font-semibold text-lg text-gray-700">Feature Analysis Report</h2>
              <p className="mt-4 text-gray-600">{report}</p>
              <button
                onClick={() => setStage('input')}
                className="mt-6 w-full p-4 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition"
              >
                Try Another Selection
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
