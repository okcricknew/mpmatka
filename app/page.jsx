import { db } from "./lib/firebase-admin";

export const dynamic = "force-dynamic";

async function getResults() {
  const snapshot = await db
    .collection("results")
    .limit(50)
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data()
  }));
}

export default async function HomePage() {
  let results = [];
  let error = "";

  try {
    results = await getResults();
  } catch (err) {
    console.error(err);
    error = "Firestore se results load nahi ho pa rahe hain.";
  }

  return (
    <main>
      <h1>Satta Matka Results</h1>
      <p>Latest results and updates</p>

      {error ? (
        <section className="result-card">
          <p>{error}</p>
        </section>
      ) : results.length === 0 ? (
        <section className="result-card">
          <p>No results available.</p>
        </section>
      ) : (
        results.map((item) => (
          <article className="result-card" key={item.id}>
            <h2>{item.name || item.title || "Result"}</h2>

            {item.date && (
              <div className="result-row">
                <strong>Date</strong>
                <span>{String(item.date)}</span>
              </div>
            )}

            {item.open && (
              <div className="result-row">
                <strong>Open</strong>
                <span>{String(item.open)}</span>
              </div>
            )}

            {item.close && (
              <div className="result-row">
                <strong>Close</strong>
                <span>{String(item.close)}</span>
              </div>
            )}
          </article>
        ))
      )}
    </main>
  );
}
