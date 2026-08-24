import { db } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic"; // Yeh page ko SSR banata hai

async function getResults() {
  try {
    const snapshot = await db
      .collection("results")
      .limit(50)
      .get();

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      
      // Agar Firestore Timestamp hai toh usko string ya safe format mein badlein
      let formattedDate = data.date;
      if (data.date && typeof data.date.toDate === "function") {
        formattedDate = data.date.toDate().toISOString();
      }

      return {
        id: doc.id,
        ...data,
        date: formattedDate ? String(formattedDate) : null,
      };
    });
  } catch (error) {
    console.error("Firestore Error:", error);
    throw error; // Catch block error throw karega taaki UI mein dikh sake
  }
}

export default async function HomePage() {
  let results = [];
  let error = "";

  try {
    results = await getResults();
  } catch (err) {
    error = "Firestore se results load nahi ho pa rahe hain.";
  }

  return (
    <main style={{ padding: "20px" }}>
      <h1>Satta Matka Results</h1>
      <p>Latest results and updates (SSR Enabled)</p>

      {error ? (
        <section className="result-card" style={{ color: "red" }}>
          <p>{error}</p>
        </section>
      ) : results.length === 0 ? (
        <section className="result-card">
          <p>No results available.</p>
        </section>
      ) : (
        results.map((item) => (
          <article className="result-card" key={item.id} style={{ border: "1px solid #ccc", margin: "10px 0", padding: "10px" }}>
            <h2>{item.name || item.title || "Result"}</h2>

            {item.date && (
              <div className="result-row">
                <strong>Date: </strong>
                <span>{item.date}</span>
              </div>
            )}

            {item.open && (
              <div className="result-row">
                <strong>Open: </strong>
                <span>{String(item.open)}</span>
              </div>
            )}

            {item.close && (
              <div className="result-row">
                <strong>Close: </strong>
                <span>{String(item.close)}</span>
              </div>
            )}
          </article>
        ))
      )}
    </main>
  );
}
