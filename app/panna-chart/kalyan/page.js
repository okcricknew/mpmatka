// app/panna-chart/kalyan/page.js
import { db } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';

async function updateKalyanPannaData(formData: FormData) {
  'use server';
  const chartData = formData.get('chartData') as string;

  try {
    await db.collection('charts').doc('kalyan_panna').set({
      market: 'kalyan',
      chartType: 'panna',
      data: chartData,
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    revalidatePath('/panna-chart/kalyan');
  } catch (error) {
    console.error("Error updating Kalyan Panna:", error);
  }
}

export default async function KalyanPannaChartPage() {
  let rawData = "";

  try {
    const docSnap = await db.collection('charts').doc('kalyan_panna').get();
    if (docSnap.exists) {
      rawData = docSnap.data()?.data || "";
    }
  } catch (error) {
    console.error("Error fetching Kalyan Panna from Firebase:", error);
  }

  return (
    <main className="min-h-screen bg-gray-100 p-2 sm:p-4 font-sans">
      <div className="max-w-xl mx-auto bg-white border-2 border-blue-900 shadow-lg">
        
        {/* Header Title */}
        <div className="bg-blue-600 text-white text-center py-3 font-bold text-lg tracking-wider">
          KALYAN PANNA CHART
        </div>

        {/* Screenshot Jaisa Table UI */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-center">
            <thead>
              <tr className="border-b-2 border-gray-300 bg-yellow-50 text-red-600 font-bold text-xs sm:text-sm">
                <th className="py-2 px-1 border-r border-gray-300">DATE</th>
                <th className="py-2 px-1 border-r border-gray-300 text-green-700">MON</th>
                <th className="py-2 px-1 border-r border-gray-300 text-green-700">TUE</th>
                <th className="py-2 px-1 border-r border-gray-300 text-green-700">WED</th>
                <th className="py-2 px-1 border-r border-gray-300 text-green-700">THU</th>
                <th className="py-2 px-1 border-r border-gray-300 text-green-700">FRI</th>
                <th className="py-2 px-1 text-green-700">SAT</th>
              </tr>
            </thead>
            <tbody>
              {rawData ? (
                <tr>
                  <td colSpan={7} className="p-4 text-xs whitespace-pre-wrap font-mono text-left">
                    {rawData}
                  </td>
                </tr>
              ) : (
                <tr>
                  <td colSpan={7} className="py-6 text-gray-500 text-xs">
                    No data available. Please update using admin panel below.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Admin Update Section with Button */}
        <div className="bg-gray-50 border-t-2 border-gray-300 p-4 mt-4">
          <h3 className="text-xs font-bold text-red-600 mb-2 uppercase">
            Admin: Update Kalyan Panna Data
          </h3>
          <form action={updateKalyanPannaData} className="flex flex-col gap-3">
            <textarea 
              name="chartData" 
              rows={5}
              defaultValue={rawData}
              placeholder="Enter chart data..."
              required
              className="w-full p-2 border border-gray-300 text-xs rounded font-mono focus:outline-none focus:border-blue-600"
            />
            <button 
              type="submit"
              className="bg-red-600 text-white text-xs font-bold py-2 px-4 rounded hover:bg-red-700 transition"
            >
              Update Chart Data
            </button>
          </form>
        </div>

      </div>
    </main>
  );
          }

